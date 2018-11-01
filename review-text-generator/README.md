# Review Text Generator

The Review Text Generator is trained to generate English-language text similar to the text in the Yelp review data set.

This directory contains the steps for and the output of converting the model to a web friendly format supported by TensorFlow.js


## Model

#### Source

The [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/keras/generative_lang_model/generative_lang_model.h5) used is from the [MAX Review Text Generator](https://github.com/IBM/MAX-Review-Text-Generator).

To get familiar with the MAX Review Text Generator model follow its instructions to deploy it to Docker or Kubernetes.

Alternatively, the MAX Review Text Generator model can be run in a Jupyter environment by launching the notebook provided in this directory.

#### Output

The web friendly model produced by running `tensorflowjs_converter` can be found in the [`/review-text-generator/model`](https://github.com/vabarbosa/tfjs-sandbox/tree/master/review-text-generator/model) directory.

> **Note**: _The Jupyter notebook also contains the code used to convert to model._





## Assets

Optional assets included which may be useful when running the TensorFlow.js model

- `chars-array.json` - character mapping for the indices from the [probability array](https://github.com/IBM/MAX-Review-Text-Generator/blob/master/core/backend.py#L89) returned by the model



### MAX Source

[https://github.com/IBM/MAX-Review-Text-Generator](https://github.com/IBM/MAX-Review-Text-Generator)


### Model Files
[http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/keras/generative\_lang\_model/generative\_lang\_model.h5](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/keras/generative_lang_model/generative_lang_model.h5)


## DIY

The following steps were taking to convert the MAX Review Text Generator model to web friendly format:

1. Install [`tensorflowjs`]() Python module
1. Download and extract the [pre-trained model](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/deeplab/deeplabv3_mnv2_pascal_trainval_2018_01_29.tar.gz)  
1. From a terminal, run the following command:  

```
tensorflowjs_converter \
    --input_format=keras \
    {model_path} \
    {web_asset_dir}
```

where  

- **{model\_path}** is the path to the model file
- **{web\_asset\_dir}** is the directory to save the converted model files

