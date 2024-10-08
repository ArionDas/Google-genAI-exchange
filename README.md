# Socratic Learning – AI-Powered Educational Platform
![Features](https://github.com/ArionDas/Google-genAI-exchange/blob/bb4c6ca1407283041541b79bab09e16bf32e461f/visuals/desk.jpg)
## Project Overview
Socratic Learning is an AI-powered educational platform designed to revolutionize learning through the Socratic method. The platform engages students with thought-provoking questions, promotes critical thinking, and provides a comprehensive learning environment using multimodal support, interactive tools, and personalized paths for continuous learning.
## Overview of Our Idea 
Our application is an innovative Socratic learning platform designed to revolutionize education by providing personalized, 1:1 teaching experiences at scale. Leveraging advanced technologies, the platform utilizes an AI Chat Assistant that engages students through the Socratic method, guiding them with targeted questions to foster critical thinking and deeper understanding.

Key features include multimodal learning support, allowing students to ask questions through images, videos, or text, alongside an integrated code editor for real-time coding and debugging. Our Resource Suggestion Engine curates relevant materials, while Interactive Visualization Tools dynamically illustrate complex concepts in data structures and algorithms.

The platform also incorporates self-evaluation tools for customized testing and activity tracking to monitor student progress. With gamified learning elements, students earn badges for achievements, keeping them motivated.

Looking ahead, we plan to introduce collaborative learning features like forums and study groups, integrate with external educational platforms for high-quality courses, and provide live certified courses led by experts. Additionally, we aim to integrate the Gemini model as our central Large Language Model for enhanced capabilities and personalized responses. We are also considering adding closed-source LLMs, which will be used for inference by deployed AWS GPUs upon funding, to make the AI Assistant even more robust. Future enhancements will include an AI assistant using Lang Graph for improved navigation and a scalable architecture design to reduce inference time.

In a crowded ed-tech market, our solution stands out by seamlessly combining these features under one roof, emphasizing the Socratic approach to create a transformative and engaging learning experience.

## Architecture
![Architecture](https://github.com/ArionDas/Google-genAI-exchange/blob/05fc7788ce7dddf5dd5e29120f999e372043c789/visuals/Architecture.png)

The platform architecture integrates AI-powered questioning with multimodal learning, real-time visualization, and performance tracking tools.

### Key Components:
1. **`AI Chat Assistant`**: Engages students with Socratic questioning to promote problem-solving and deeper understanding.
2. **`Multimodal Learning Support`**:
   - Image-Based Queries
   - Video Summarization
   - Text-Based Doubt Resolution
3. **`Interactive Visualization Tools`**: Enables real-time visualizations for Data Structures and Algorithms (DSA).
4. **`Integrated Code Editor`**: An environment for coding, testing, and debugging in real-time.
5. **`Self-Evaluation Tools`**: Customizable tests to focus on weak areas.
6. **`Activity Tracking and Heatmap`**: Provides insights into student engagement and progress.
7. **`Gamified Learning`**: Motivational badges to encourage learning milestones.
8. **`Motivational AI Assistant`**: Delivers daily motivational quotes to inspire students.

### Current LLM Model : 
- **`Framework`** : Groq
- **`Model`** : LLama 3 70B


## In-Scope Features
- **`AI Chat Assistant`**: Engages students through the Socratic method, enhancing critical thinking.
- **`Multimodal Learning Support`**:
  - Image-Based Queries: Upload diagrams, code screenshots, etc., to ask questions.
  - Video Summarization: Summarize and clarify doubts at specific timestamps.
  - Text-Based Doubt Resolution: Ask questions directly in text format.
- **`Interactive Visualization Tools`**: Real-time visualizations of DSA operations like sorting, searching, and traversals.
- **`Resource Suggestion Engine`**: Suggests curated articles, videos, and personalized learning paths.
- **`Integrated Code Editor`**: Write, test, and debug code with real-time feedback.
- **`Self-Evaluation Tools`**: Generate customizable tests with adjustable difficulty levels.
- **`Activity Tracking and Heatmap`**: Visualize engagement and monitor study habits.
- **`Gamified Learning with Achievement Badges`**: Earn motivational badges to track learning progress:
  


- **`Motivational AI Assistant`**: Daily motivational quotes to keep students inspired.

## Out of Scope
- **`Accuracy of Information`**: Responses are based on Large Language Models (LLMs) and may not be 100% accurate. Users should verify important information independently.

## Future Opportunities
1. **`Collaborative Learning Features`**: Add forums, study groups, and peer-to-peer interaction tools.
2. **`Integration with External Educational Platforms`**: Partner with established educational platforms for high-quality courses.
3. **`Live Certified Courses`**: Provide live certified courses and expert-led learning opportunities.
4. **`Gemini Model Integration`**: The platform plans to integrate the Gemini model as the central Large Language Model (LLM) for the application, enhancing its capability to handle complex queries, provide more nuanced responses, and support a wider variety of learning formats. This upgrade will ensure more accurate, contextually aware, and personalized responses for students.
5. **`Lang Graph Agent AI Assistant`**: We plan to add an AI agent using Lang Graph, making our application more robust and accessible for the user. This will help the user navigate to any feature from anywhere.
6. **`Inference Time`**: Scalable architecture design to reduce inference time.

## Challenges Faced During Development

1. **`JSON Response Issues from LLM`**:
- *Problem*: Encountered inconsistencies in the JSON responses returned by the Language Model (LLM), which led to errors in data parsing.
- *Solution*: Implemented additional validation checks to ensure the integrity of the JSON data. This involved logging unexpected responses for further analysis and adjusting the parsing logic accordingly.

2. **`Gemini and Langchain Integration Challenges`**:
- *Problem*: While integrating Gemini with Langchain agents, we encountered some technical challenges related to compatibility, which affected the smooth interaction between the two systems in our specific use case.
- *Solution*: After careful consideration, we decided to temporarily explore alternative models that seamlessly integrated with Langchain agents for this phase of the project. We remain optimistic about future updates and enhancements in Gemini, and look forward to leveraging its powerful capabilities in upcoming versions as the ecosystem evolves.

3. **`CORS Policy Issues`**:
- *Problem*: Faced Cross-Origin Resource Sharing (CORS) issues that prevented the frontend from accessing backend APIs.
- *Solution*: Configured the server to include the necessary CORS headers, allowing requests from the frontend domain. This involved modifying server settings and testing various configurations to ensure compatibility.

4. **`Multimodal Chat Implementation`**:
- *Problem*: Difficulty in integrating multimodal chat capabilities, which required handling different input types (text, images, etc.).
- *Solution*: Conducted thorough research on available libraries and frameworks. After experimenting with several options, successfully integrated a suitable library that facilitated multimodal interactions.

5. **`Heatmap Generation for Streak Days`**
- *Problem*: Challenges in generating heatmaps to visualize user engagement over streak days, primarily due to a lack of clear documentation and examples.
- *Solution*: Invested time in reading documentation and exploring various libraries. After testing multiple approaches, I found a library that met the project’s requirements and provided clear examples, leading to successful implementation.

6. **`LangGraph Assistant`** : 

- *Problem* : We wanted to have all our features ("chat with AI", "multimodal chat", "quiz", etc.) as nodes in our LangGraph agent. The purpose was to provide the user the freedom to navigate 
   to any node from any node. 
   Unfortunately, we encountered unprecedented errors during the development, and the documentation is not self-exhaustive to address the aforementioned issue.

## Installation

1. **`Clone the repository`**:

   ```bash
   https://github.com/ArionDas/Google-genAI-exchange.git

2. **`Install the required dependencies`**:

   ```bash
   pip install -r requirements.txt

3. **`You can access the live application via this link`**:

   https://google-gen-ai-exchange.vercel.app/

4. **`Demo Video`**:

   [Socratic Learning](https://drive.google.com/file/d/12_Ub1vCefJu5IYlumuuamY1mg8AquDbe/view?usp=sharing)  

   (Demo Email : i2@gmail.com) <br>
   (Demo password : 123456789)
