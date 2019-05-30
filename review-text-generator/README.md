# Review Text Generator

The Review Text Generator is trained to generate English-language text similar to the text in the Yelp review data set.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js


## Model

#### Source

The [pre-trained model](https://max-assets.s3.us.cloud-object-storage.appdomain.cloud/review-text-generator/1.0/assets.tar.gz) used is taken from the [Model Asset eXchange](https://ibm.biz/max-models) (MAX).

To try out the [MAX Review Text Generator](https://developer.ibm.com/exchanges/models/all/max-review-text-generator/) follow its instructions to deploy it to Docker or Kubernetes.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/review-text-generator/model`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/review-text-generator/model) directory.

To see how to run the converted model in a browser follow the instructions in the [`/review-text-generator/demo`](https://github.com/vabarbosa/tfjs-model-playground/tree/master/review-text-generator/demo) directory.


## Assets

Optional assets included which may be useful when running the TensorFlow.js model

- [`chars-array.json`](https://github.com/vabarbosa/tfjs-model-playground/blob/master/review-text-generator/assets/chars-array.json) - character mapping for the indices from the probability array returned by the model


## DIY

The following steps were taking to convert the MAX Review Text Generator model to web friendly format:

1. Install [`tensorflowjs`](https://pypi.org/project/tensorflowjs) Python module
    - `pip install tensorflowjs==1.1.2`
1. Download and extract the [pre-trained model](https://max-assets.s3.us.cloud-object-storage.appdomain.cloud/review-text-generator/1.0/assets.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=keras \
    {keras_model_path} \
    {web_asset_dir}
```

where  

- **{keras\_model\_path}** is the path to the extracted Keras model file (`generative_lang_model.h5`)
- **{web\_asset\_dir}** is the directory to save the converted model files
