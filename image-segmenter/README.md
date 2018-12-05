# Image Segmenter

The Image Segmenter is trained to identify objects in an image.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js


## Model

#### Source

The [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/deeplab/deeplabv3_mnv2_pascal_trainval_2018_01_29.tar.gz) used is taken from the [Model Asset Exchange](https://developer.ibm.com/code/exchanges/models) (MAX).

To try out the [MAX Image Segmenter](https://github.com/IBM/MAX-Image-Segmenter) follow its instructions to deploy it to Docker or Kubernetes.

Alternatively, the MAX Image Segmenter model can be run in a Jupyter environment by launching the notebook (`max-image-segmenter.ipynb`) provided in this repository.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/image-segmenter/model`](https://github.com/vabarbosa/tfjs-sandbox/tree/master/image-segmenter/model) directory.

> **Note**: _The Jupyter notebook also contains the code used to convert the model._

To run the converted model in a browser follow the instructions in the [`/image-segmenter/demo`](https://github.com/vabarbosa/tfjs-sandbox/tree/master/image-segmenter/demo) directory.


## Assets

Optional assets included which may be useful when using the TensorFlow.js model

- `color-map.json` - [colormap](https://github.com/IBM/MAX-Image-Segmenter/blob/master/core/utils.py#L7) for visualizing segmentation results


## DIY

The following steps were taking to convert the MAX Image Segmenter model to web friendly format:

1. Install [`tensorflowjs`]() Python module
1. Download and extract the [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/deeplab/deeplabv3_mnv2_pascal_trainval_2018_01_29.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=tf_frozen_model \
    --output_node_names='SemanticPredictions' \
    {frozen_graph_path} \
    {web_asset_dir}
```

where  

- **{frozen\_graph\_path}** is the path to the extracted frozen model
- **{web\_asset\_dir}** is the directory to save the converted model files
