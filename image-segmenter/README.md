# Image Segmenter

### MAX Source

[https://github.com/IBM/MAX-Image-Segmenter](https://github.com/IBM/MAX-Image-Segmenter)


### Model Files

[http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/deeplab/deeplabv3\_mnv2\_pascal\_trainval\_2018\_01\_29.tar.gz](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/deeplab/deeplabv3_mnv2_pascal_trainval_2018_01_29.tar.gz)


### Script

```
tensorflowjs_converter \
    --input_format=tf_frozen_model \
    --output_node_names='SemanticPredictions' \
    --saved_model_tags=serve \
    {frozen_graph_path} \
    {web_asset_dir}
```

where  

- **{frozen\_graph\_path}** is the path to the frozen model file
- **{web\_asset\_dir}** is the directory to save the converted model files


### Assets

- `color-map.js` - [colormap](https://github.com/IBM/MAX-Image-Segmenter/blob/master/core/utils.py#L7) for visualizing segmentation results
