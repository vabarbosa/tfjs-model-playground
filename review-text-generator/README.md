# Review Text Generator

### MAX Source

[https://github.com/IBM/MAX-Review-Text-Generator](https://github.com/IBM/MAX-Review-Text-Generator)

### Model Files

[http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/keras/generative\_lang\_model/generative\_lang\_model.h5](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/keras/generative_lang_model/generative_lang_model.h5)


### Script

```
tensorflowjs_converter \
    --input_format=keras \
    {model_path} \
    {web_asset_dir}
```

where  

- **{model\_path}** is the path to the model file
- **{web\_asset\_dir}** is the directory to save the converted model files
