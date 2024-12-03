def get_prompts(level, prompt_key, **kwargs):
    context = kwargs.get('context', '')
    characteristics = kwargs.get('characteristics', '')
    descriptor = kwargs.get('descriptor', '')
    text = kwargs.get('text', '')
    topic = kwargs.get('topic', '')

    prompts = {
        'B2': {
            'characteristics': f'''
            What characteristics should a text about "{topic}", written at a lower-advanced level (B2 English) with an analytical/complex tone and a context (text structure) "{context}", include? Focus on depth of explanation, vocabulary, and sentence complexity. Take into account that the text must be read and understood by an English teacher, as it displays a key curricular and teaching theme that teachers must be able to handle. Ensure the text remains inside the area of expertise of an English teacher, instead of diving into themes like technology. If the topic is not directly related to English teachers, make it so that it relates to the teachers' expertise. Ensure the previously mentioned context (text structure) is taken as the most important point in the structure of the text.
            Only output the resulting characteristics, and nothing else.
            '''
            ,
            'generation': f'''
            Write a complex text about "{topic}" at a lower-advanced level (B2 English) with an analytical/complex tone, a context "{context}" and taking into account the following characteristics:
            ```
            {characteristics}
            ```
            Ensure the text is lengthy. The text must be made out of a single section.
            The amount of high-difficulty academic words must be limited, as this is a lower-advanced English reader.
            The written text must meet the requirement "{descriptor}".
            Be creative with the topics to be included in the text, do not stick to the given examples.
            The context "{context}" must be the only text structure to be used for writing.
            The text must not exceed 6 paragraphs (or its equivalent in length if it is an instruction manual).
            Only output the text, and nothing else.
            '''
            ,
            'validation': f'''
            Evaluate the following generated text:
            ```
            {text}
            ```
            Does it meet the requirements of lower-advanced difficulty (B2 English), with an analytical/complex tone, a context "{context}" and where the reader "{descriptor}", given they are an English teacher with little to no knowledge outside their area of expertise (English education). If not, rewrite the text. If abbreviations or technical terms and definitions are included in the text, they must be explained beforehand to make the reader familiar with the terms. The amount of high-difficulty academic words must be limited, as this is a lower-advanced English reader.
            Ensure vocabulary is as simple as possible.
            Only output the text, whether it was modified or not, and nothing else.
            '''
        },
        'C1': {
            'characteristics': f'''
            What characteristics should a text about "{topic}", written at an advanced level (C1 English) with an analytical/complex tone and a context (text structure) "{context}", include? Focus on depth of explanation, vocabulary, and sentence complexity. Take into account that the text must be read and understood by an English teacher, as it displays a key curricular and teaching theme that teachers must be able to handle. Ensure the previously mentioned context (text structure) is taken as the most important point in the structure of the text.
            Only output the resulting characteristics, and nothing else.
            '''
            ,
            'generation': f'''
            Write a complex text about "{topic}" at an advanced level (C1 English) with an analytical/complex tone, a context "{context}" and taking into account the following characteristics:
            ```
            {characteristics}
            ```
            Ensure the text is lengthy enough so as to make the complexity high. The text must be made out of a single section.
            The written text must meet the requirement "{descriptor}".
            Be creative with the topics to be included in the text, do not stick to the given examples.
            The context "{context}" must be the only text structure to be used for writing.
            The text must not exceed 6 paragraphs (or its equivalent in length if it is an instruction manual).
            Only output the text, and nothing else.
            '''
            ,
            'validation': f'''
            Evaluate the following generated text:
            ```
            {text}
            ```
            Does it meet the requirements of advanced difficulty (C1 English), with an analytical/complex tone, a context "{context}" and where the reader "{descriptor}", given they are an English teacher. If not, rewrite the text. If abbreviations or technical terms and definitions are included in the text, they must be explained beforehand to make the reader familiar with the terms.
            Only output the text, whether it was modified or not, and nothing else.
            '''
        }
    }

    chosen_prompt = prompts[level]
    
    # Fetch the selected prompt template
    prompt_template = chosen_prompt.get(prompt_key)
    
    # Check if the prompt exists
    if not prompt_template:
        return "Prompt not found."

    # Return formatted prompt
    return prompt_template.format(**kwargs)
