## Basic model info

Model name: bria/remove-background
Model description: BRIA RMBG 2.0 - Professional background removal with 256 levels of transparency for natural results.

Note: Previously used 851-labs/background-remover (deprecated/404 as of 2025).


## Model inputs

- image (optional): Image file (URI or file object)
- image_url (optional): Image URL (string)
- content_moderation (optional): Enable content moderation. Default: false (boolean)
- preserve_partial_alpha (optional): Preserve partial transparency levels for natural edges. Default: true (boolean)

Note: Either `image` or `image_url` must be provided.


## Model output schema

{
  "type": "string",
  "title": "Output",
  "format": "uri"
}

If the input or output schema includes a format of URI, it is referring to a file.


## Example inputs and outputs

Use these example outputs to better understand the types of inputs the model accepts, and the types of outputs the model returns:

### Example 1: Using image_url with preserve_partial_alpha

#### Input

```json
{
  "image_url": "https://pub-1f07f440a8204e199f8ad01009c67cf5.r2.dev/monsters/spray_paint_goblin.png",
  "preserve_partial_alpha": true
}
```

#### Output

```json
"https://replicate.delivery/yhqm/[unique-id]/output.png"
```

### Example 2: Using image file

#### Input

```json
{
  "image": "https://replicate.delivery/pbxt/[file-id]/input.png",
  "preserve_partial_alpha": true,
  "content_moderation": false
}
```

#### Output

```json
"https://replicate.delivery/yhqm/[unique-id]/output.png"
```


## Model readme

BRIA RMBG 2.0 is a professional-grade background removal model that uses non-binary masks with 256 levels of transparency, providing natural results with soft edges.

Key features:
- Trained exclusively on licensed data for safe commercial use
- Superior edge quality compared to open-source alternatives
- Fast CPU-based processing
- Supports partial alpha preservation for realistic compositing

Used in production by: Mystica game asset pipeline (monster generation)
