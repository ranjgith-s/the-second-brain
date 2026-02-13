# The Second Brain

For detailed setup and installation instructions, please refer to [docs/SETUP.md](docs/SETUP.md).

## Quick Start

### macOS / Linux
```bash
./setup.sh
```

### Windows
```cmd
setup.bat
```

---

# The Second Brain: Requirements Specification

> "Your digital extension. A literal second brain that evolves with you."

This document details the critical Functional and Non-Functional Requirements for "The Second Brain". It serves as the primary **Definition of Done** for the project.

## 1. Functional Requirements

### 1.1. Ingestion & Capture (The "Senses")
The system must provide seamless, low-friction methods for capturing user input.

*   **[FR-01] Voice Input (Primary Iterface)**
    *   **Tap-to-Talk**: A single prominent button to start recording audio.
    *   **Auto-Stop**: Intelligent silence detection to stop recording automatically after a pause (configurable: 2s default).
    *   **Streaming Transcription**: Real-time speech-to-text (STT) displayed to the user as they speak.
    *   **Noise Cancellation**: Basic filtering of background noise to ensure clear transcription.

*   **[FR-02] Text Input (Secondary Interface)**
    *   **Chat UI**: A standard chat interface for silent entry.
    *   **Rich Text Support**: Support for markdown (bold, lists, code blocks) in input.

*   **[FR-03] External Data Ingestion (Future Scope)**
    *   **Link Parsing**: Ability to paste a URL; the system fetches content, summarizes it, and stores it as knowledge.
    *   **File Upload**: Support for PDF/Text file analysis.

### 1.2. Intelligent Processing (The "Cortex")
The core logic layer that transforms raw input into structured knowledge.

*   **[FR-04] Intent Classification**
    *   The system must classify every input into one of:
        1.  **Memory/Note**: "I prefer dark chocolate over milk chocolate."
        2.  **Query**: "What kind of chocolate do I like?"
        3.  **Action/Search**: "Find a recipe for dark chocolate cake."
        4.  **Correction**: "Actually, I hate football now."

*   **[FR-05] Entity & Relation Extraction**
    *   **Named Entity Recognition (NER)**: Identify people, places, organizations, concepts (e.g., "Football").
    *   **Sentiment Analysis**: Determine the user's emotional stance toward the entity (e.g., "Hate", "Love").
    *   **Temporal Tagging**: Assign a valid time range for the preference/fact (e.g., `valid_from: 2023-10-27`).

### 1.3. Dynamic Memory System (The "Memory")
A RAG-capable vector database that understands time and evolution.

*   **[FR-06] Vector Embeddings**
    *   Generate and store vector embeddings for all processed notes/facts.
    *   Use a high-performance embedding model (e.g., OpenAI `text-embedding-3-small` or similar).

*   **[FR-07] Temporal Knowledge Management (Crucial)**
    *   **Conflict Detection**: When new information contradicts old information (e.g., "I love football" vs "I hate football"), the system must flag the contradiction.
    *   **Evolution Logic**: 
        *   Newer user statements about *preferences* override older ones.
        *   Older statements are *not deleted* but marked as `historical` or `archived` to provide context ("You used to like football").
    *   **Recency Weighing**: Retrieval algorithms must boost scores for more recent data points.

### 1.4. Retrieval & Augmentation (The "Recall")
How the system answers questions.

*   **[FR-08] Context-Aware Retrieval**
    *   Retrieve relevant notes based on semantic similarity to the user's query.
    *   Filter retrieval results by *current validity* to avoid fetching outdated preferences as "truth".

*   **[FR-09] Web Search & Synthesis**
    *   **Agent Capability**: If the system lacks internal knowledge (e.g., "Who won the game last night?"), it triggers a web search.
    *   **Knowledge Consolidation**: The results of the web search are summarized and *stored in the Vector DB* as a new memory node, linked to the query. This "grows" the second brain.

### 1.5. Output & Interaction
*   **[FR-10] Multi-Modal Response**
    *   **Text Response**: Concise, direct answers.
    *   **Voice Synthesis (TTS)**: High-quality, natural-sounding voice output (optional for MVP, priority for V2).
*   **[FR-11] Proactive Suggestions**
    *   Based on context (time of day, location, recent topics), suggest relevant notes or actions (e.g., "You usually adjust your portfolio on Fridays. Want to review your finance notes?").

---

## 2. Non-Functional Requirements (NFRs)

### 2.1. Performance & Latency
*   **[NFR-01] Interaction Latency**:
    *   Max **2 seconds** from end-of-speech to start-of-response for voice interactions.
    *   Max **500ms** for database retrieval queries.
*   **[NFR-02] Scalability**: 
    *   Vector DB must support up to **100,000 vectors** with <100ms search latency.

### 2.2. Privacy & Security
*   **[NFR-03] Data Sovereignty**: 
    *   Preference for local-first storage or private cloud.
    *   User data is encrypted at rest (AES-256).
*   **[NFR-04] LLM Privacy**: 
    *   No user data used for training public models. Use enterprise endpoints or local LLMs (e.g., Llama 3) where possible.

### 2.3. Reliability & Accuracy
*   **[NFR-05] Hallucination Rate**: < 5% on factual retrieval from own knowledge base.
*   **[NFR-06] Availability**: 99.9% uptime for the capture interface (offline caching required if server is unreachable).

### 2.4. Usability (UX)
*   **[NFR-07] Minimalist Design**: The UI should have < 3 primary actions on the main screen. Focus on content, not controls.
*   **[NFR-08] Accessibility**: Fully accessible via screen readers; high contrast mode support.

---

## 3. Definition of Done (MVP)

A release is considered "Done" when the following user journeys are fully functional:

1.  **[ ] The "Capture" Journey**: 
    *   User opens app -> Taps specific button -> Speaks "I need to buy milk" -> App transcribes -> App confirms "Added to shopping list" -> Note appears in "Recent".
2.  **[ ] The "Recall" Journey**:
    *   User asks "What did I need to buy?" -> System searches vector DB -> Returns "Milk".
3.  **[ ] The "Evolution" Journey**:
    *   User says "I hate milk now, I'm vegan." -> System updates preference.
    *   User asks "Do I like milk?" -> System replies "No, you mentioned you are vegan as of [Date]."
4.  **[ ] The "Growth" Journey**:
    *   User asks "What is the capital of Mongolia?" (Unknown fact) -> System searches web -> Returns "Ulaanbaatar" -> Saves fact.
    *   User asks "Capital of Mongolia?" (Offline) -> System answers "Ulaanbaatar" from memory.