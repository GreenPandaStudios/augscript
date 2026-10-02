// aug-spec: "tensors.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.5"

/** Add two CPU tensors using LibTorch and return the sum of their elements. */
calculate() returns float unless TensorError:
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    return sum(tensor=result)

test calculate:
    when cpu:
        it adds_and_reads_real_tensors:
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
            assert(output.get(index=0) == 5.0)
            assert(output.get(index=1) == 7.0)
            assert(output.get(index=2) == 9.0)
            assert(sum(tensor=result) == 21.0)
            assert(calculate() == 21.0)
