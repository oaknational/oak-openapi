/**
 * ESLint rule to prevent GateWithReason from being used in boolean contexts
 * without explicitly calling .isAllowed() or .isBlocked()
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow GateWithReason in boolean contexts',
      category: 'Best Practices',
    },
    messages: {
      useTypeGuard:
        'GateWithReason must use .isAllowed() or .isBlocked() in boolean contexts',
    },
  },
  create(context) {
    const gateWithReasonTypes = new Set(['GateWithReason']);
    const gateWithReasonVariables = new Set();

    function isGateWithReasonType(node) {
      if (!node) return false;

      if (node.type === 'AwaitExpression') {
        return isGateWithReasonType(node.argument);
      }

      if (node.type === 'TSAsExpression' || node.type === 'TSTypeAssertion') {
        return isGateWithReasonType(node.expression);
      }

      if (node.type === 'TSNonNullExpression') {
        return isGateWithReasonType(node.expression);
      }

      if (node.type === 'ChainExpression') {
        return isGateWithReasonType(node.expression);
      }

      if (node.type === 'ParenthesizedExpression') {
        return isGateWithReasonType(node.expression);
      }

      // Check for direct identifier (simple case)
      if (node.type === 'Identifier') {
        if (gateWithReasonTypes.has(node.name)) {
          return true;
        }

        if (gateWithReasonVariables.has(node.name)) {
          return true;
        }
      }
      // Check for call expression like isSubjectSupported(...)
      if (node.type === 'CallExpression') {
        const callee = node.callee;
        if (callee.type === 'Identifier') {
          // Functions returning GateWithReason
          const gateReturningFunctions = [
            'isSubjectSupported',
            'isUnitSupported',
            'isLessonSupported',
            'blockLessonForCopyrightText',
            'blockUnitForCopyrightText',
            'checkLessonAllowedAsset',
            'isBlockedUnitOrSubject',
            'supportsImages',
            'isSequenceSubjectBlocked',
          ];
          return gateReturningFunctions.includes(callee.name);
        }
      }

      return false;
    }

    function trackAssignment(left, right) {
      if (!left || left.type !== 'Identifier') return;

      if (isGateWithReasonType(right)) {
        gateWithReasonVariables.add(left.name);
      } else {
        gateWithReasonVariables.delete(left.name);
      }
    }

    return {
      VariableDeclarator(node) {
        if (!node.init) return;
        trackAssignment(node.id, node.init);
      },
      AssignmentExpression(node) {
        trackAssignment(node.left, node.right);
      },
      IfStatement(node) {
        if (isGateWithReasonType(node.test)) {
          context.report({
            node: node.test,
            messageId: 'useTypeGuard',
          });
        }
      },
      LogicalExpression(node) {
        // Check both sides of && and ||
        if (isGateWithReasonType(node.left)) {
          context.report({
            node: node.left,
            messageId: 'useTypeGuard',
          });
        }
        if (isGateWithReasonType(node.right)) {
          context.report({
            node: node.right,
            messageId: 'useTypeGuard',
          });
        }
      },
      ConditionalExpression(node) {
        if (isGateWithReasonType(node.test)) {
          context.report({
            node: node.test,
            messageId: 'useTypeGuard',
          });
        }
      },
      UnaryExpression(node) {
        if (node.operator === '!' && isGateWithReasonType(node.argument)) {
          context.report({
            node: node.argument,
            messageId: 'useTypeGuard',
          });
        }
      },
    };
  },
};
