# Human Pose Estimator

The Human Pose Estimator is trained to detect humans and their poses in a given image.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js.


## Model

#### Source

The [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/human-pose-estimator/1.0/assets.tar.gz) used is taken from the [Model Asset eXchange](https://ibm.biz/max-models) (MAX).

To try out the [MAX Human Pose Estimator](https://developer.ibm.com/exchanges/models/all/max-human-pose-estimator/) follow its instructions to deploy it to Docker or Kubernetes.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/human-pose-estimator/model`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/human-pose-estimator/model) directory.

To see how to run the converted model in a browser follow the instructions in the [`/human-pose-estimator/demo`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/human-pose-estimator/demo) directory.


## Assets

Optional assets that may be useful when using the TensorFlow.js model

- [`coco-common.json`](https://github.com/vabarbosa/tfjs-model-playground/blob/master/human-pose-estimator/assets/coco-common.json) - mapping of the body [parts and pairs](https://github.com/IBM/MAX-Human-Pose-Estimator/blob/master/core/tf_pose/common.py) when interpreting the prediction results


## DIY

The following steps were taken to convert the MAX Human Pose Estimator model to the web friendly format:

> _The MAX Human Pose Estimator model is a frozen graph. Frozen model formats have been deprecated since TensorFlow.js 1.0. To convert frozen models, it is recommended to use older versions (i.e., 0.8.x)._

1. Install [`tensorflowjs`](https://pypi.org/project/tensorflowjs/) Python module
    - `pip install tensorflowjs==0.8.5`
1. Download and extract the [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/human-pose-estimator/1.0/assets.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=tf_frozen_model \
    --output_node_names='Openpose/concat_stage7' \
    --output_json=true
    {frozen_graph_path} \
    {web_asset_dir}
```

where  

- **{frozen\_graph\_path}** is the path to the extracted frozen model file (i.e., `human-pose-estimator-tensorflow.pb`)
- **{web\_asset\_dir}** is the directory to save the converted model files
