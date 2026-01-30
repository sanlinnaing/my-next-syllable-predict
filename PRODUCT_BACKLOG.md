# Product Backlog

## Product Goal

Create a web-based text editor with real-time next syllable prediction to enhance the user's writing speed and experience.

## Epics

-   **Frontend Development:** Build the user interface and user experience for the web application.
-   **Model Integration (Client-Side):** Integrate and run the tflite model for syllable prediction directly in the user's browser.
-   **Deployment:** Deploy the application to a GitHub Gist page.

## User Stories

### Frontend Development

-   **As a user, I want to see a text input field where I can type my text.**
    -   **Acceptance Criteria:**
        -   There is a clear and visible text area on the page.
        -   The user can type and edit text within this area.

-   **As a user, I want to see a ghost text in the input field that suggests the next syllable.**
    -   **Acceptance Criteria:**
        -   As the user types, a suggestion for the next syllable appears as ghost text within the input field.
        -   The ghost text is visually distinct from the user's actual input (e.g., lighter color).

-   **As a user, I want to see three possible next syllable suggestions below the text input field.**
    -   **Acceptance Criteria:**
        -   Below the text input, three buttons or clickable elements display alternative syllable suggestions.
        -   These suggestions update in real-time as the user types.

-   **As a user, I want to be able to click on one of the suggestions to append it to my text.**
    -   **Acceptance Criteria:**
        -   Clicking one of the three suggestion buttons appends the suggested syllable to the text in the input field.
        -   The cursor is placed at the end of the newly appended text.
        -   The ghost text and suggestions update based on the new text.

-   **As a user, I want the text in the textbox to be displayed in the Myanmar3 font.**
    -   **Acceptance Criteria:**
        -   The `Myanmar3` font is loaded by the web page.
        -   The text input field and suggestion elements use the `Myanmar3` font.

-   **As a user, I want to read a short introduction and instructions on the page.**
    -   **Acceptance Criteria:**
        -   There is a section on the page with a brief introduction to the project.
        -   Clear instructions are provided on how to use the syllable prediction feature.

### Model Integration (Client-Side)

-   **As a developer, I want to load and run a tflite model in the browser.**
    -   **Acceptance Criteria:**
        -   The tflite model file is successfully loaded by the web application.
        -   A function exists to pass input text to the model and receive predictions.

-   **As a developer, I want to process the model's output to extract the top 3 syllable predictions.**
    -   **Acceptance Criteria:**
        -   The raw output from the tflite model is correctly parsed.
        -   The top 3 most probable next syllables are identified.

-   **As a developer, I want to integrate the model's predictions with the UI.**
    -   **Acceptance Criteria:**
        -   The top prediction is displayed as ghost text.
        -   The top three predictions are displayed as clickable suggestions.

### Deployment

-   **As a developer, I want to set up the project to be deployed as a GitHub Gist page.**
    -   **Acceptance Criteria:**
        -   The project is structured to work correctly when hosted on a Gist.
        -   A script or instructions are available for deploying the project to a Gist.
