// aug-spec: "compute.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer and openDevice and upload and add and download from "https://github.com/GreenPandaStudios/aug-gpu#4a7ce9d4c74de8b355b49926d100d7e185923f2c"

/** Add two lists on a GPU and return copied values. GPU resources stay local. */
calculate(List<float> left, List<float> right) returns List<float>:
    own Device device = openDevice()
    own Buffer first = upload(device, values=left)
    own Buffer second = upload(device, values=right)
    own Buffer result = add(left=first, right=second)
    return download(buffer=result)


test calculate:
    when native:
        it copies_the_GPU_result:
            List<float> result = calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
            assert(result.length() == 3)
            assert(result.get(index=0) == 5.0)
            assert(result.get(index=1) == 7.0)
            assert(result.get(index=2) == 9.0)
