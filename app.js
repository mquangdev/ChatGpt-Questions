const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
const QuestionType = {
  choosePair: 0,
  chooseAnswer: 1,
  chooseToBlank: 2,
  typeToBlank: 3,
};

async function createQuestion(content, numberQuestion, type) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content: `You are helping a Vietnamese teacher generating ${numberQuestion} different questions, generate to JSON format, include randomly multiple and single correct answers, all the contents are in Vietnamese, the format is as follows:
                  title: brief title of the question;
                  text: 
                            if ${type} is ${QuestionType.chooseAnswer} or ${QuestionType.typeToBlank}
                              text is content of the question;
                            if ${type} is ${QuestionType.chooseAnswer} 
                              text is "Chọn cặp phù hợp";
                            if ${type} is ${QuestionType.chooseToBlank} 
                              This if a form of selecting the answer in the blank, so you will need 2 pieces of text on both sides and in the middle is the blank space, the first piece of text is this field and the second piece of text is textBonus field below;
                  textBonus: if ${type} is ${QuestionType.chooseToBlank} the second piece of question
                  type: ${type} this is type of this question;
                  answerList: 
                            (
                              if ${type} is ${QuestionType.chooseAnswer} this field will be an array of answers generate randomly with the length is 4
                                format of this fields is array with each element is {
                                    value: content of answer (type string)
                                }, it is only one element with value is correct with the question content, and another must be wrong
                              if ${type} is ${QuestionType.choosePair} this filed will be list of questions and corresponding answers with at least 6 elements
                                format of this fields is array with each element is {
                                    text: content of the question (string)
                                    value: content of answer corresponding with the filed text above (string)
                                }
                              if ${type} is ${QuestionType.chooseToBlank} this field will be an array of answers generate randomly with the length is 4
                                format of this fields is array with each element is {
                                    value: this field is the phrase in between the two components text and textBonus to form a question (type string)
                                }, it is only one element with value is correct with the question content, and another must be wrong
                            );
                  value: this is right answer of this question
                           (
                              if ${type} is ${QuestionType.chooseAnswer} or ${QuestionType.chooseToBlank}
                                the value field of element which is correct with the question content (type string)
                              if ${type} is ${QuestionType.chooseToBlank} 
                                the value field of element which is correct with the question content (type string)
                              if ${type} is ${QuestionType.typeToBlank} 
                                this is the correct answer with corresponding with the field text above (type string)
                           )
                }
              You must return exactly ${numberQuestion} and can only return maximum 10 questions at a time even if I ask for more in the above. 
              `,
          },
          { role: "user", content: content },
        ],
        model: "gpt-3.5-turbo",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    throw new Error(error.message);
  }
}

app.post("/api/create-question", async (req, res) => {
  try {
    const { content, numberQuestion } = req.body;
    const questions = await createQuestion(content, numberQuestion);
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
