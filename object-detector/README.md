# Object Detector

The Object Detector is trained to localize and identify multiple objects in a single image.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js.


## Model

#### Source

The [pre-trained model](https://max-assets-prod.s3.us-south.cloud-object-storage.appdomain.cloud/max-object-detector/1.0.1/model.tar.gz) used is taken from the [Model Asset eXchange](https://ibm.biz/max-models) (MAX).

To try out the [MAX Object Detector](https://developer.ibm.com/exchanges/models/all/max-object-detector/) follow its instructions to deploy it to Docker or Kubernetes.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/object-detector/model`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/object-detector/model) directory.

To see how to run the converted model in a browser follow the instructions in the [`/object-detector/demo`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/object-detector/demo) directory.


## Assets

Optional assets that may be useful when using the TensorFlow.js model

- [`labels-map.json`](https://github.com/vabarbosa/tfjs-model-playground/blob/master/object-detector/assets/labels-map.json) - label mapping for the indices from the detection_scores, detection_boxes, and detection_classes arrays returned by the model


## DIY

The following steps were taken to convert the MAX Object Detector model to the web friendly format:

> _The MAX Object Detector model is a frozen graph. Frozen model formats have been deprecated since TensorFlow.js 1.0. To convert frozen models, it recommended to use older versions (i.e., 0.8.x)._

1. Install [`tensorflowjs`](https://pypi.org/project/tensorflowjs/) Python module
    - `pip install tensorflowjs==0.8.6`
1. Download and extract the [pre-trained model](https://max-assets-prod.s3.us-south.cloud-object-storage.appdomain.cloud/max-object-detector/1.0.1/model.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=tf_frozen_model \
    --output_node_names=detection_boxes,detection_scores,detection_classes \
    --output_json=true
    {frozen_graph_path} \
    {web_asset_dir}
```

where  

- **{frozen\_graph\_path}** is the path to the extracted frozen model file (i.e., `object-detector/1.0.1/frozen_inference_graph.pb`)
- **{web\_asset\_dir}** is the directory to save the converted model files
