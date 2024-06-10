const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const home = require("./routes/home");
dotenv.config();

const corsOptions = {
  origin: "http://localhost:4200", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
// Routes
app.use("/home", home);
const QuestionType = {
  choosePair: 0,
  chooseAnswer: 1,
  chooseToBlank: 2,
  typeToBlank: 3,
};

async function createQuestionChooseAnswer(content, numberQuestion, type) {
  try {
    let response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content: `You are helping a Vietnamese teacher generating ${numberQuestion} different questions. Remind that all questions have the same type field is ${type}, generate to JSON format, include randomly multiple and single correct answers, all the contents are in Vietnamese, the format is as follows:
                  title: brief title of the question;
                  text: this filed is content of this question;
                  type: ${QuestionType.chooseAnswer};
                  answerList: this field will be an array of answers generate randomly with the length is 4
                              format of this fields is array with each element is 
                              {
                                  value: content of answer (type string)
                              }, 
                              it is only one element with value is correct with the question content (text field), and another must be wrong;
                  value: the value field of element which is correct with the question content (type string);
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
async function createQuestionChoosePair(content, numberQuestion) {
  try {
    let response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content: `You are helping a Vietnamese teacher generating ${numberQuestion} different questions. Remind that all questions have the same type field is ${QuestionType.choosePair}, generate to JSON format, all the contents are in Vietnamese, the format is as follows:
                  title: brief title of the question;;
                  text: content is "Chọn cặp phù hợp";
                  type: ${QuestionType.choosePair};
                  answerList: this filed will an array of pair of question and answer corresponding with 6 elements
                                format of this fields is array with format of each element is {
                                    text: content of the question (string)
                                    value: content of answer correct corresponding with the filed text above (string)
                                } (Note that these pairs of text and value do not overlap in the filed value, such as {text: "1+10", value: "11"} and {text: "9+2", value: "11"} have the same field value is "11" will be not allowed)
                }
              You must return exactly ${numberQuestion} questions different and can only return maximum 10 questions at a time even if I ask for more in the above.
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
async function createQuestionChooseToBlank(content, numberQuestion) {
  try {
    let response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content: `You are helping a Vietnamese teacher generating ${numberQuestion} different questions. Remind that all questions have the same type field is ${QuestionType.chooseToBlank}, generate to JSON format, include randomly multiple and single correct answers, all the contents are in Vietnamese, the format is as follows:
                  title: content is "";
                  text: content of the question (This is a form of selecting the answer in the blank, so you will need 2 pieces of text on both sides and in the middle is the blank space, the first piece of text is this field and the second piece of text is textBonus field below);
                  textBonus: the second piece of question;
                  type: ${QuestionType.chooseToBlank};
                  answerList:
                          this field will be an array of answers generate randomly with the length is 4
                            format of this fields is array with each element is {
                                value: this field is the phrase in between the two components text and textBonus to form a question (type string)
                            }, it is only one element with value is correct with the question content, and another must be wrong
                          );
                  value: this is right answer of this question (from array answerList above) (important: this field cannot be null)
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
async function createQuestionTypeToBlank(content, numberQuestion) {
  try {
    let response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content: `You are helping a Vietnamese teacher generating ${numberQuestion} different questions. Remind that all questions have type field is ${QuestionType.typeToBlank}, generate to JSON format, all the contents are in Vietnamese, the format is as follows:
                  title: brief title of the question;
                  text: content of the question;
                  type: ${QuestionType.typeToBlank};
                  value: this is the correct answer corresponding with the field text above (type string)
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
    const { content, numberQuestion, type } = req.body;
    let questions;
    switch (type) {
      case QuestionType.choosePair: {
        questions = await createQuestionChoosePair(content, numberQuestion);
        break;
      }
      case QuestionType.chooseAnswer: {
        questions = await createQuestionChooseAnswer(content, numberQuestion);
        break;
      }
      case QuestionType.chooseToBlank: {
        questions = await createQuestionChooseToBlank(content, numberQuestion);
        break;
      }
      case QuestionType.typeToBlank: {
        questions = await createQuestionTypeToBlank(content, numberQuestion);
        break;
      }
    }
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
