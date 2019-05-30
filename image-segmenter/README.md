# Image Segmenter

The Image Segmenter is trained to identify objects in an image.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js


## Model

#### Source

The [pre-trained model](http://max-assets.s3.us.cloud-object-storage.appdomain.cloud/image-segmenter/1.0/assets.tar.gz) used is taken from the [Model Asset eXchange](https://ibm.biz/max-models) (MAX).

To try out the [MAX Image Segmenter](https://developer.ibm.com/exchanges/models/all/max-image-segmenter/) follow its instructions to deploy it to Docker or Kubernetes.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/image-segmenter/model`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/image-segmenter/model) directory.

To see how to run the converted model in a browser follow the instructions in the [`/image-segmenter/demo`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/image-segmenter/demo) directory.


## Assets

Optional assets that may be useful when using the TensorFlow.js model

- [`color-map.json`](https://github.com/vabarbosa/tfjs-model-playground/blob/master/image-segmenter/assets/color-map.json) - colormap for visualizing segmentation results


## DIY

The following steps were taken to convert the MAX Image Segmenter model to the web friendly format:

> _The MAX Image Segmenter model is a frozen graph. Frozen model formats have been deprecated since TensorFlow.js 1.0. To convert frozen models, it recommended to use older versions (i.e., 0.8.x)._

1. Install [`tensorflowjs`](https://pypi.org/project/tensorflowjs/) Python module
    - `pip install tensorflowjs==0.8.5`
1. Download and extract the [pre-trained model](http://max-assets.s3.us.cloud-object-storage.appdomain.cloud/image-segmenter/1.0/assets.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=tf_frozen_model \
    --output_node_names='SemanticPredictions' \
    --output_json=true
    {frozen_graph_path} \
    {web_asset_dir}
```

where  

- **{frozen\_graph\_path}** is the path to the extracted frozen model file (i.e., `deeplabv3_mnv2_pascal_trainval/frozen_inference_graph.pb`)
- **{web\_asset\_dir}** is the directory to save the converted model files
