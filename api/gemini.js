if (task === "exercises") {
  const txt = payload.text;
  const result = await model.generateContent(
    `Based on this lesson text, create 3 short practice exercises 
    for a student. Format them as plain numbered questions, one per line:\n\n${txt}`
  );
  return res.status(200).json({ result: result.response.text() });
}

if (task === "checkAnswer") {
  const { question, studentAnswer } = payload;
  const result = await model.generateContent(
    `The question was:\n${question}\n
    The student answered:\n${studentAnswer}
    Evaluate correctness, explain briefly, and provide the right solution if needed.`
  );
  return res.status(200).json({ result: result.response.text() });
}
