# Multi-prompting

One of the core foundations of the API is the ability to generate images via prompting. With multi-prompting, you can mix concepts together by assigning each prompt a specific weight. Check out the examples below to learn how to execute multi-prompting calls via our API. With the ability to assign weights to individual prompts, developers can now negatively prompt Stable Diffusion, a popular strategy for generating more creative images by informing the model to avoid certain concepts.

Try it out live by clicking the link below to open the notebook in Google Colab!

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1q6EnvbxWpvnbucEvg3Bpu90jUkwx6nGn?usp=sharing)

## Python Example {#python-example}

### 1. Install the Stability SDK package... {#install-sdk}

```bash
pip install stability-sdk
```

### 2. Import our dependencies and set up our environment variables and API Key... {#setup-environment}

```python
import os
import io
import warnings
from PIL import Image
from stability_sdk import client
import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation

# Our Host URL should not be prepended with "https" nor should it have a trailing slash.
os.environ['STABILITY_HOST'] = 'grpc.stability.ai:443'

# Sign up for an account at the following link to get an API Key.
# https://platform.stability.ai/

# Click on the following link once you have created an account to be taken to your API Key.
# https://platform.stability.ai/account/keys

# Paste your API Key below.

os.environ['STABILITY_KEY'] = 'key-goes-here'
```

### 3. Connect to the Stability API... {#api-connection}

```python
# Set up our connection to the API.
stability_api = client.StabilityInference(
    key=os.environ['STABILITY_KEY'], # API Key reference.
    verbose=True, # Print debug messages.
    engine="stable-diffusion-xl-1024-v1-0", # Set the engine to use for generation.
    # Check out the following link for a list of available engines: https://platform.stability.ai/docs/features/api-parameters#engine
)
```

### 4. Set up basic text-to-image parameters, save image on generation, and warning for if the safety filter is tripped... {#initial-parameters}

```python
answers = stability_api.generate(
    prompt="beautiful night sky above japanese town, anime style",
    seed=1229080980, # If a seed is provided, the resulting generated image will be deterministic.
                     # What this means is that as long as all generation parameters remain the same, you can always recall the same image simply by generating it again.
                     # Note: This isn't quite the case for CLIP Guided generations, which we tackle in the CLIP Guidance documentation.
    steps=50, # Amount of inference steps performed on image generation. Defaults to 30.
    cfg_scale=8.0, # Influences how strongly your generation is guided to match your prompt.
                   # Setting this value higher increases the strength in which it tries to match your prompt.
                   # Defaults to 7.0 if not specified.
    width=1024, # Generation width, if not included defaults to 512 or 1024 depending on the engine.
    height=1024, # Generation height, if not included defaults to 512 or 1024 depending on the engine.
    samples=1, # Number of images to generate, defaults to 1 if not included.
    sampler=generation.SAMPLER_K_DPMPP_2M # Choose which sampler we want to denoise our generation with.
                                                 # Defaults to k_dpmpp_2m if not specified. Clip Guidance only supports ancestral samplers.
                                                 # (Available Samplers: ddim, plms, k_euler, k_euler_ancestral, k_heun, k_dpm_2, k_dpm_2_ancestral, k_dpmpp_2s_ancestral, k_lms, k_dpmpp_2m, k_dpmpp_sde)
)

# Set up our warning to print to the console if the adult content classifier is tripped.
# If adult content classifier is not tripped, save generated images.
for resp in answers:
    for artifact in resp.artifacts:
        if artifact.finish_reason == generation.FILTER:
            warnings.warn(
                "Your request activated the API's safety filters and could not be processed."
                "Please modify the prompt and try again.")
        if artifact.type == generation.ARTIFACT_IMAGE:
            img = Image.open(io.BytesIO(artifact.binary))
            img.save(str(artifact.seed)+ ".png") # Save our generated images with their seed number as the filename.
```

### Resulting image written to `<seed>.png`:

![](/BasicPrompt.png)

### 5. Set up multiprompt text-to-image parameters based on previous basic prompt for comparison... {#multiprompt-parameters}

```python
# Note: With multi-prompting, we can provide each prompt a specific weight. Negative weights are used to prompt the model to avoid certain concepts.
# Prompts with token lengths beyond 77 will be truncated. Default prompt weight is 1 if not specified.
answers = stability_api.generate(
    prompt= [generation.Prompt(text="beautiful night sky above japanese town, anime style",parameters=generation.PromptParameters(weight=1)),
    generation.Prompt(text="clouds",parameters=generation.PromptParameters(weight=-1))],
    # In the example above we are negative prompting clouds out of the initial concept.
    # When determining prompt weights, the total possible range is [-10, 10] but we recommend staying within the range of [-2, 2].
    seed=1229080980, # If a seed is provided, the resulting generated image will be deterministic.
                    # What this means is that as long as all generation parameters remain the same, you can always recall the same image simply by generating it again.
                    # Note: This is only true for non-CLIP Guided generations.
    steps=50, # Amount of inference steps performed on image generation. Defaults to 30.
    cfg_scale=8.0, # Influences how strongly your generation is guided to match your prompt.
                   # Setting this value higher increases the strength in which it tries to match your prompt.
                   # Defaults to 7.0 if not specified.
    width=1024, # Generation width, if not included defaults to 512 or 1024 depending on the engine.
    height=1024, # Generation height, if not included defaults to 512 or 1024 depending on the engine.
    samples=1, # Number of images to generate, defaults to 1 if not included.
    sampler=generation.SAMPLER_K_DPMPP_2M # Choose which sampler we want to denoise our generation with.
                                                 # Defaults to k_dpmpp_2m if not specified. Clip Guidance only supports ancestral samplers.
                                                 # (Available Samplers: ddim, plms, k_euler, k_euler_ancestral, k_heun, k_dpm_2, k_dpm_2_ancestral, k_dpmpp_2s_ancestral, k_lms, k_dpmpp_2m, k_dpmpp_sde)
)

# Set up our warning to print to the console if the adult content classifier is tripped.
# If adult content classifier is not tripped, save generated images.
for resp in answers:
    for artifact in resp.artifacts:
        if artifact.finish_reason == generation.FILTER:
            warnings.warn(
                "Your request activated the API's safety filters and could not be processed."
                "Please modify the prompt and try again.")
        if artifact.type == generation.ARTIFACT_IMAGE:
            img = Image.open(io.BytesIO(artifact.binary))
            img.save(str(artifact.seed)+ ".png") # Save our generated images with their seed number as the filename.
```

### Resulting image written to `<seed>.png`:

![](/MultiPrompt.png)

**Note:** This is not representative of all of the parameters available for image generation.

Please check out our [protobuf reference](https://github.com/Stability-AI/api-interfaces/blob/main/src/proto/generation.proto) for a complete list of parameters available for image generation.
