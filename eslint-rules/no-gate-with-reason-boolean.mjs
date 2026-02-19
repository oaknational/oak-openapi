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

    function isGateWithReasonType(node) {
      if (!node) return false;

      // Check for direct identifier (simple case)
      if (node.type === 'Identifier' && gateWithReasonTypes.has(node.name)) {
        return true;
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

    // function checkNode(node) {
    //   // Check if parent is a type guard call
    //   const parent = node.parent;
    //   if (
    //     parent &&
    //     parent.type === 'CallExpression' &&
    //     parent.callee.type === 'MemberExpression' &&
    //     (parent.callee.property.name === 'isAllowed' ||
    //       parent.callee.property.name === 'isBlocked')
    //   ) {
    //     return; // This is fine
    //   }

    //   // Check if it's in a boolean context without a type guard
    //   if (isGateWithReasonType(node)) {
    //     context.report({
    //       node,
    //       messageId: 'useTypeGuard',
    //     });
    //   }
    // }

    return {
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
