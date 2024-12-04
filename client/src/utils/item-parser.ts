export const parseItem = (items: Object) => {
  let data = [
    ['CEFR Level', 'PELEx Descriptor', 'Context', 'Text'],
  ];

  for (let generation in items) {
    console.log(generation)
    data.push([
      generation["level"],
      generation["descriptor"],
      generation["context"],
      generation["text"]
    ])
  }
  return data;
};
