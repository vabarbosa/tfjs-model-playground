# Image Caption Generator

The Image Caption Generator is trained to generates captions for an image from a fixed vocabulary.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js.


## Model

#### Source

The [pre-trained model](http://max-assets.s3.us.cloud-object-storage.appdomain.cloud/image-caption-generator/1.0/assets.tar.gz) used is taken from the [Model Asset eXchange](https://ibm.biz/max-models) (MAX).

To try out the [MAX Image Caption Generator](https://developer.ibm.com/exchanges/models/all/max-image-caption-generator/) follow its instructions to deploy it to Docker or Kubernetes.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/image-caption-generator/model`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/image-caption-generator/model) directory.

To see how to run the converted model in a browser follow the instructions in the [`/image-caption-generator/demo`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/image-caption-generator/demo) directory.


## Assets

Optional assets that may be useful when using the TensorFlow.js model

- [`word-counts.txt`](https://github.com/vabarbosa/tfjs-model-playground/blob/master/image-caption-generator/assets/word-counts.txt) - the list of words that make up the fixed vocabulary and their frequency count.


## DIY

The following steps were taken to convert the MAX Image Caption Generator model to the web friendly format:

> _The MAX Image Caption Generator model contained checkpoint files. The checkpoint files were loaded and re-saved as a frozen graph. The frozen model was then converted to TensorFlow.js web format. Frozen model formats have been deprecated since TensorFlow.js 1.0. To convert frozen models, it recommended to use older versions (i.e., 0.8.x)._

1. Install [`tensorflowjs`](https://pypi.org/project/tensorflowjs/) Python module
    - `pip install tensorflowjs==0.8.6`
1. Download and extract the [pre-trained model](http://max-assets.s3.us.cloud-object-storage.appdomain.cloud/image-caption-generator/1.0/assets.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=tf_frozen_model \
    --output_node_names='softmax,lstm/initial_state,lstm/state' \
    --output_json=true
    {frozen_graph_path} \
    {web_asset_dir}
```

where  

- **{frozen\_graph\_path}** is the path to the extracted frozen model file (i.e., `model/frozen-graph.pb`)
- **{web\_asset\_dir}** is the directory to save the converted model files
