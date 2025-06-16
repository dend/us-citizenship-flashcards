# US Citizenship Test Flashcards Website

- Your goal is to implement a modern website for folks to be able to prepare for the US Citizenship Test.
- You have all the questions for the citizenship test in the `questions.txt` file in the root of the repository.
    - You need to convert this into a JSON and ensure that every question has associated metadata:
        - Question text
        - Section
        - Subsection
        - Answers (can be one or many - all strings)
- The website should fit the theme of America - red, white, and blue.
- As much as possible, avoid package dependencies that are not necessary.

## Site components

### Header

- Come up with a good name that reflects what the site is about.
- Very short description.
- The eagle emoji included as logo.
- Using a modern, bold font.

### Flashcard

- Centered on the page is a flashcard. It can flip on click/tap.
- On one side there is a question, along with a tag and subtag, reflecting the section and subsection of the question.
- On the other side is the answer(s) - there can be several, so make sure you format them as a list.
- Background color of the sides of flashcard should be different.
- After the question is flipped (they see the answer), they can go to next question.
- Questions should not be repeated unless reset.
- User can reset questions and start from zero (all questions are randomly popped into the flashcard).

### Question marking

- For every question, I want you to offer two options:
    - Next question. Only after seeing the answer. This will randomly select another question from the pool of questions that were NOT ASKED before.
    - Skip question. Do not show answer, just go to another random question.
    - Earmark question. Flag the question that you want to come back to it later. That means it's re-inserted into the question pool.

### Counter

- Make sure there is a counter that shows how many questions you showed, questions remaining, questions earmarked, and questions skipped.

### Footer

- Include a note that this was built by Den Delimarsky, with a link to https://den.dev.
- You need to add a clear disclaimer at the bottom (footer)that the site is not affiliated with the US government in any capacity and material here may be out of date.
    - Make sure to tell people that they should ALWAYS refer to the USCIS Naturalization Test and Study Resources (https://www.uscis.gov/citizenship/find-study-materials-and-resources) for the most up-to-date materials.
    - This site does not guarantee accuracy and relevance for current US citizenship tests.
    - Visitors bear all of the responsibility for preparing for the test using official USCIS materials. This is just a study guide.

### Metadata

- Make sure that the page has clear OpenGraph metadata for SEO discoverability.
- There is also a favicon configuration (I will provide the icon).
- Metadata should be configurable from a JSON file that you will create in the repository.