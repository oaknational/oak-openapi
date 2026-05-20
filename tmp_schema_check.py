import json

with open('schema.graphql') as f:
    data = json.load(f)

view = 'published_mv_lesson_openapi_1_2_3'
types = data['data']['__schema']['types']

select_col = view + '_select_column'
for t in types:
    if t.get('name') == select_col:
        vals = t.get('enumValues') or []
        for v in sorted(vals, key=lambda x: x.get('name', '')):
            print(v.get('name'))
        break
else:
    print(f"{select_col} not found")
