import * as tf from "@tensorflow/tfjs";

export default class NeuralNetwork {
    model: tf.Sequential;
    allWeights: Array<number>;

    constructor(netData) {
        this.model = tf.sequential();
        this.model.add(
            tf.layers.dense({
                units: 20,
                batchInputShape: [1, 36],
                activation: "relu",
            })
        );
        this.model.add(
            tf.layers.dense({
                units: 5,
                activation: "relu",
            })
        );
        if (netData) {
            this.setModelWeights(netData.weights);
        }
    }

    scaleInputLayer(allData: Array<number>): Array<number> {
        // scale by 500 (rough scaling factor of window) up to the last three
        // elements, which get scaled by 10
        for (let i = 0; i < allData.length; i++) {
            if (i < allData.length - 3) {
                allData[i] = allData[i] / 500;
            } else {
                allData[i] = allData[i] / 10;
            }
        }
        return allData;
    }

    setModelWeights(objData: Array<number>): void {
        // unpack objData to weights and biases of each layer
        const checkpoint1 = 36 * 20;
        const checkpoint2 = checkpoint1 + 20;
        const checkpoint3 = checkpoint2 + 20 * 5;
        const checkpoint4 = checkpoint3 + 5;
        const firstWeights = objData.slice(0, checkpoint1);
        const firstBiases = objData.slice(checkpoint1, checkpoint2);
        const secondWeights = objData.slice(checkpoint2, checkpoint3);
        const secondBiases = objData.slice(checkpoint3, checkpoint4);
        // set weights and biases to model
        const firstWeightTensor = tf.tensor2d(
            firstWeights,
            [36, 20],
            "float32"
        );
        const firstBiasTensor = tf.tensor1d(firstBiases, "float32");
        const secondWeightTensor = tf.tensor2d(
            secondWeights,
            [20, 5],
            "float32"
        );
        const secondBiasTensor = tf.tensor1d(secondBiases, "float32");
        const allTensors = [
            firstWeightTensor,
            firstBiasTensor,
            secondWeightTensor,
            secondBiasTensor,
        ];
        this.model.setWeights(allTensors);
        // garbage clean up
        allTensors.forEach((tens) => {
            tf.dispose(tens);
        });
    }

    async getModelWeights() {
        this.allWeights = [
            ...Array.from(await this.model.getWeights()[0].data()),
            ...Array.from(await this.model.getWeights()[1].data()),
            ...Array.from(await this.model.getWeights()[2].data()),
            ...Array.from(await this.model.getWeights()[3].data()),
        ];
        return this.allWeights;
    }

    async feedForward(inputLayer: Array<number>) {
        // takes in the input layer and spits out the output layer
        // weights are 36 x 5 and biases are length 5
        const inputs = tf.tensor2d([inputLayer]);
        const res = this.model.predict(inputs) as tf.Tensor;
        // });
        const dat = await res.data();
        // find the index of the maximum value
        let maxVal = dat[0];
        let maxIdx = 0;
        for (let i = 1; i < dat.length; i++) {
            if (dat[i] > maxVal) {
                maxIdx = i;
                maxVal = dat[i];
            }
        }
        // avoid memory leaks
        tf.dispose(res);
        tf.dispose(inputs);
        return maxIdx;
    }
}
