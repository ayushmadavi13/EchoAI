import os
from datasets import load_dataset

def stream_msmarco_dataset(split="train", max_records=None):
    """
    Streams the MSMARCO-XI dataset directly from HuggingFace.
    This prevents having to download the massive dataset locally (which is likely what you meant by 'hosting the dataset').
    """
    print(f"Streaming dataset ai4bharat/MSMARCO-XI ({split} split)...")
    # 'streaming=True' loads the dataset on the fly without downloading it all to disk
    dataset = load_dataset("ai4bharat/MSMARCO-XI", split=split, streaming=True)
    
    count = 0
    for record in dataset:
        if max_records and count >= max_records:
            break
        yield record
        count += 1
