# La Roue SPUGNA

A festive, AI-powered web application that automates a family's Christmas gift exchange with an optimized, fair, and mysterious spinning wheel experience.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Zgoubnight/generated-app-20251120-190201)

## About The Project

La Roue SPUGNA is a festive and interactive web application designed to manage a family's Christmas gift exchange. It replaces a manual draw with a fair, optimized, and mysterious digital experience. The core of the application is a sophisticated algorithm that calculates a single, globally optimal gift assignment for all participants, ensuring fairness based on strict, predefined rules.

The user experience is designed to be playful and enchanting. Users log in by simply selecting their name from a list, and results are revealed through a charming spinning wheel animation. To maintain the mystery, users can only see the names of the four people they are assigned to give gifts to. For transparency, a public bar chart displays the total number of gifts each person receives, confirming the fairness of the draw without revealing who gives to whom. As a final touch, an integrated AI assistant, powered by Google's Gemini model, provides personalized gift suggestions for the assigned recipients.

## Key Features

-   **Optimized & Fair Draw:** A sophisticated algorithm ensures a single, globally fair gift assignment based on predefined family rules (e.g., no one draws themselves, their partner, or their own children).
-   **Mystery Mode:** Users can only see the recipients they are assigned to, keeping the gift exchange a surprise for everyone.
-   **Interactive Spinning Wheel:** A fun, animated spinning wheel reveals the gift recipients, adding a touch of magic to the experience.
-   **Equity Chart:** A public bar chart shows the total number of gifts each person receives, providing transparency and confirming the fairness of the distribution.
-   **AI Gift Assistant:** Powered by Google Gemini, an integrated AI provides personalized gift suggestions for each assigned recipient.
-   **Simple & Secure Login:** Password-less login where users simply select their name from a list.
-   **Admin Panel:** Dedicated controls for administrators to initiate or reset the global gift draw.

## Technology Stack

-   **Frontend:** React, Vite, Tailwind CSS
-   **UI Components:** shadcn/ui, Lucide React
-   **Animations:** Framer Motion
-   **State Management:** Zustand
-   **Backend:** Cloudflare Workers, Hono
-   **Data Persistence:** Cloudflare Durable Objects
-   **AI Integration:** Google Gemini
-   **Data Visualization:** Chart.js, react-chartjs-2

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated: `bunx wrangler login`.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/la_roue_spugna.git
    cd la_roue_spugna
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root of the project for local development. You will need to get your Account ID and create an AI Gateway from your Cloudflare dashboard.

    ```ini
    # .dev.vars

    # Cloudflare AI Gateway URL
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"

    # Cloudflare API Key with AI Gateway permissions
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    ```

## Development

To run the application in development mode, which includes both the Vite frontend and the Cloudflare Worker backend with hot-reloading:

```sh
bun dev
```

This will start the Vite development server, typically on `http://localhost:3000`.

## Deployment

Deploying the application to Cloudflare is a straightforward process.

1.  **Build and deploy the application:**
    Make sure you have configured your `wrangler.jsonc` with your Cloudflare account details if you haven't already. Then, run the deploy script:
    ```sh
    bun deploy
    ```
    This command will build the frontend application and deploy both the static assets and the worker to your Cloudflare account.

2.  **Deploy with the button:**
    Alternatively, you can deploy this project to Cloudflare Workers with a single click.

    [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Zgoubnight/generated-app-20251120-190201)

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.