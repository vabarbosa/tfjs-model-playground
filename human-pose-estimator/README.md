# Human Pose Estimator

The Human Pose Estimator is trained to detect humans and their poses in a given image.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js


## Model

#### Source

The [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/human-pose-estimator/1.0/assets.tar.gz) used is taken from the [Model Asset Exchange](https://developer.ibm.com/code/exchanges/models) (MAX).

To try out the [MAX Human Pose Estimator](https://github.com/IBM/MAX-Human-Pose-Estimator) follow its instructions to deploy it to Docker or Kubernetes.

Alternatively, the MAX Human Pose Estimator model can be run in a Jupyter environment by launching the notebook (`max-human-pose-estimator.ipynb`) provided in this repository.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/human-pose-estimator/model`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/human-pose-estimator/model) directory.

- `/pb`: contains model converted from a version prior to 1.0 (of TensorFlow.js and `tensorflowjs_converter`)
- `/json`: contains model converted from version 1.0 (of TensorFlow.js and `tensorflowjs_converter`)

> **Note**: _The Jupyter notebook also contains the code used to convert the model._

To run the converted model in a browser follow the instructions in the [`/human-pose-estimator/demo`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/human-pose-estimator/demo) directory.


## Assets

Optional assets that may be useful when using the TensorFlow.js model

- `coco-common.json` - mapping of the body [parts and pairs](https://github.com/IBM/MAX-Human-Pose-Estimator/blob/master/core/tf_pose/common.py) when interpreting the prediction results


## DIY

The following steps were taken to convert the MAX Human Pose Estimator model to the web friendly format:

1. Install [`tensorflowjs`](https://pypi.org/project/tensorflowjs/) Python module
1. Download and extract the [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/human-pose-estimator/1.0/assets.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=tf_frozen_model \
    --output_node_names='Openpose/concat_stage7' \
    {model_path} \
    {web_asset_dir}
```

where  

- **{model\_path}** is the path to the extracted model
- **{web\_asset\_dir}** is the directory to save the converted model files
