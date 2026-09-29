import sys

workload, count = sys.argv[1], int(sys.argv[2])
if workload == 'startup':
    print(7)
elif workload == 'cpu':
    state = 123
    for index in range(count):
        product = state * 48271
        state = product - (product // 2147483647) * 2147483647
    print(state)
elif workload == 'collections':
    values, unique = {}, set()
    for index in range(count):
        values[index] = index * 3
        unique.add(index)
    checksum = sum(value for key, value in values.items() if key in unique)
    print(checksum)
    print(str(len(values) == len(unique)).lower())
elif workload == 'json':
    import json
    checksum = 0
    for index in range(count):
        value = json.loads('{"id":7,"message":"hello","values":[1,2,3]}')
        checksum += value['id'] + len(json.dumps(value, separators=(',', ':')))
    print(checksum)
else:
    raise ValueError('Unknown workload')
