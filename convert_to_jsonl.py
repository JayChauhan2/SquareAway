import json

system_prompt = "You are a helpful study assistant. Keep your answers concise for chat display, wrap all formulas in LaTeX (use $...$ for inline math), and do not write huge paragraphs."

# Open our generated JSON dataset
with open("chatbot_training_data.json", "r") as f:
    data = json.load(f)

# Write to JSONL format for Together AI / OpenAI fine-tuning
with open("together_training_data.jsonl", "w", encoding="utf-8") as f:
    for row in data:
        # Each line needs to be a valid JSON object matching the chat API format
        jsonl_line = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": row["input"]},
                {"role": "assistant", "content": row["output"]}
            ]
        }
        # Dump the dict as a JSON string and write as a line
        f.write(json.dumps(jsonl_line) + "\n")

print(f"Successfully converted {len(data)} examples to together_training_data.jsonl!")
