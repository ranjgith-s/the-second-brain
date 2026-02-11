# 00. Technology Choices & Comparison

**Date**: 2024-05-24
**Status**: Proposed

## Context

We are building "The Second Brain", a personal AI assistant that acts as a digital extension of the user's mind. The core requirements include:
-   **Real-time Voice Interaction**: Low latency (<2s voice-to-voice) is critical.
-   **Long-term Memory**: RAG-capable vector database with temporal awareness.
-   **Offline Capabilities**: Core features should work without internet (or degrade gracefully).
-   **"Ironman JARVIS" Feel**: High-quality UI/UX and seamless interaction.
-   **Privacy**: User data should be secure and private.

We need to select a technology stack that supports these requirements while balancing development velocity, performance, and scalability.

## Decision Analysis

### 1. Frontend Framework (Mobile & Web)

| Option | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- |
| **React Native (Expo)** | - **Unified Stack**: Shares logic/components with Next.js web app.<br>- **Direct Access to Native APIs**: Excellent support for Microphone/Audio streams.<br>- **Over-the-Air Updates**: Push fixes instantly.<br>- **Large Ecosystem**: Huge community and library support. | - Performance can be slightly lower than pure native for heavy animations (though Reanimated 3 solves most of this).<br>- Debugging native crashes can be tricky. | **Selected** (for Mobile) |
| **Flutter** | - **Performance**: Compiled to native code, very fast.<br>- **Consistency**: UI looks identical across platforms.<br>- **Skia Engine**: Great for custom, complex UI rendering. | - **Different Language**: Requires Dart, splitting the codebase (Web is React).<br>- **Ecosystem**: Smaller than JS/React ecosystem.<br>- **Web Support**: Flutter for Web is still heavy/laggy compared to React DOM. | Rejected |
| **Native (Swift/Kotlin)** | - **Best Performance**: Unmatched speed and access to OS features.<br>- **Platform Features**: Day 1 support for new iOS/Android features. | - **Slow Velocity**: Requires two separate codebases and teams.<br>- **High Cost**: Expensive to maintain. | Rejected |
| **Next.js (PWA)** | - **Simplicity**: One codebase for everything.<br>- **Web Standards**: Easy to deploy and update. | - **Limited Hardware Access**: Background audio, wake words, and high-performance audio processing are limited in browsers.<br>- **No "App Store" Presence**: Harder discovery and installation for users. | **Selected** (for Web Dashboard) |

**Decision**: Use **React Native (Expo)** for the mobile app to maximize code sharing with the **Next.js** web dashboard while retaining native audio capabilities.

---

### 2. Backend API & Orchestration

| Option | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- |
| **Python (FastAPI)** | - **AI Ecosystem**: Native language of AI (PyTorch, LangChain, HuggingFace).<br>- **Speed**: Fast async support, comparable to Node/Go for IO-bound tasks.<br>- **Simplicity**: Easy to read and maintain.<br>- **Libraries**: Rich support for data processing and scientific computing. | - **Runtime Performance**: Slower CPU-bound performance than Go/Rust.<br>- **Concurrency**: GIL limitations (though improved in 3.13, async helps). | **Selected** |
| **Go (Gin/Echo)** | - **Performance**: Extremely fast execution and low memory footprint.<br>- **Concurrency**: Goroutines are perfect for handling thousands of concurrent WebSocket streams.<br>- **Type Safety**: Strong static typing. | - **AI Integration**: Calling Python ML libraries requires RPC/FFI, adding complexity.<br>- **Verbosity**: More boilerplate code than Python. | Considered (for Gateway only) |
| **Node.js / TypeScript** | - **Unified Language**: Same language as frontend.<br>- **IO Performance**: Excellent event loop for WebSockets.<br>- **Ecosystem**: Massive package registry. | - **AI Support**: JS AI libraries are maturing but lag behind Python significantly.<br>- **Compute**: Poor performance for heavy compute tasks (embedding generation, etc.). | Rejected |

**Decision**: Use **Python (FastAPI)** as the core backend service. It provides the best balance of performance (via async) and seamless integration with AI libraries (LangChain/LangGraph, OpenAI SDK, etc.), which is critical for the "Cortex".

---

### 3. Vector Database (Long-Term Memory)

| Option | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- |
| **pgvector (PostgreSQL)** | - **Simplicity**: Single database for relational (user, chat logs) and vector data.<br>- **ACID Compliance**: Transactional integrity (e.g., delete user = delete vectors automatically).<br>- **Cost**: No extra infrastructure if already using Postgres.<br>- **Filtering**: Join vector search with standard SQL filters (e.g., `WHERE user_id = X`). | - **Scale**: Can be slower than specialized DBs at massive scale (millions of vectors), though IVFFlat/HNSW indexes help.<br>- **Features**: Fewer "AI-native" features (hybrid search requires setup). | **Selected** |
| **Pinecone** | - **Managed**: Zero maintenance, fully managed service.<br>- **Performance**: consistently fast at scale.<br>- **Features**: Hybrid search out-of-the-box. | - **Cost**: Expensive at scale.<br>- **Data Silo**: Data is separated from your primary DB, requiring sync logic.<br>- **Latency**: Network hop to external service. | Rejected |
| **Weaviate** | - **Multi-modal**: Native support for images/audio.<br>- **modules**: Built-in vectorization modules.<br>- **Graph-like**: Better handling of object relationships. | - **Complexity**: Another customized database to manage and host.<br>- **Memory**: Memory-hungry (Java/Go based). | Rejected |

**Decision**: Use **pgvector** extension on **PostgreSQL**.
*Reasoning*: For a personal "Second Brain", the scale (thousands to tens of thousands of notes) is well within pgvector's capabilities. The operational simplicity of a single database for all data types outweighs the theoretical performance benefits of a dedicated vector DB. It also simplifies data consistency and backups.

---

### 4. LLM Orchestration & Agent Framework

| Option | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- |
| **LangGraph (LangChain)** | - **Stateful**: Designed for graph-based flows (cyclic), perfect for agents that need to "think" in loops.<br>- **Control**: Fine-grained control over agent state and transitions.<br>- **Ecosystem**: Deep integration with LangChain tools. | - **Complexity**: Steeper learning curve than simple chains.<br>- **New**: Still evolving rapidly. | **Selected** |
| **LangChain (Chains)** | - **Simple**: Easy for linear "input -> prompt -> output" flows.<br>- **Popular**: Massive community and examples. | - **Limited**: Hard to build complex, looping agent behaviors (e.g., "retry search if results are bad"). | Rejected (for Core Logic) |
| **Haystack** | - **Modular**: Clean, pipeline-based architecture.<br>- **Production-Ready**: Strong focus on NLP pipelines. | - **Generative Focus**: Historically more focused on extractive QA than generative agents (though changing). | Rejected |

**Decision**: Use **LangGraph**.
*Reasoning*: The "Second Brain" requires an agent that can reason, loop, and correct itself (e.g., "Search web -> Evaluation results -> Search again if needed"). LangGraph is purpose-built for this stateful, cyclic agentic behavior.

---

### 5. Speech-to-Text (The Ear)

| Option | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- |
| **Deepgram** | - **Speed**: Fastest specialized STT API (often <300ms).<br>- **Features**: Diarization, specialized models (Nova-2).<br>- **Streaming**: Excellent WebSocket streaming support. | - **Cost**: Paid service (though generous free tier).<br>- **Accuracy**: Slightly lower than Whisper Large-v3 on very obscure terms, but generally excellent. | **Selected** (for Cloud) |
| **OpenAI Whisper (API)** | - **Accuracy**: Industry standard for accuracy.<br>- **Simplicity**: Easy to implement. | - **Latency**: Slower than Deepgram, especially for short utterances.<br>- **No Streaming**: Only file uploads (Chunking required for "pseudo-streaming"). | Rejected |
| **Local Whisper (whisper.cpp)** | - **Privacy**: Zero data leaves the device.<br>- **Cost**: Free.<br>- **Offline**: Works without internet. | - **Resource Intensive**: Drains battery on mobile devices.<br>- **Accuracy vs Speed**: Tiny models are fast but inaccurate; large models are accurate but slow on mobile. | **Selected** (for Local/Offline Fallback) |

**Decision**: **Hybrid Strategy**.
-   **Primary**: **Deepgram** for ultra-low latency cloud transcription when online.
-   **Fallback**: **Local Whisper (small/tiny)** on device when offline or for privacy mode.

---

### 6. Text-to-Speech (The Voice)

| Option | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- |
| **OpenAI TTS (HD)** | - **Quality**: Extremely natural and expressive.<br>- **Cost**: Reasonable pricing. | - **Latency**: Can be slow (1-2s) without optimized streaming.<br>- **Voices**: Limited set of pre-defined voices. | **Selected** (MVP) |
| **ElevenLabs** | - **Quality**: Best-in-class, indistinguishable from human.<br>- **Cloning**: Ability to clone user's voice.<br>- **Latency**: "Turbo" models are very fast. | - **Cost**: Significantly more expensive at scale.<br>- **Rate Limits**: Stricter limits on lower tiers. | Considered (Future) |
| **Local / OS TTS** | - **Latency**: Instant.<br>- **Cost**: Free.<br>- **Offline**: Always available. | - **Quality**: Robotic and unnatural compared to AI models. | **Selected** (Offline Fallback) |

**Decision**: **OpenAI TTS** for the MVP due to the balance of quality and ease of use. **ElevenLabs** as a premium upgrade option later. Use **OS Native TTS** as a fallback for offline mode.

---

### 7. Deployment & Infrastructure

| Option | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- |
| **Docker Compose (VPS)** | - **Simplicity**: Easy to understand and manage.<br>- **Portability**: Runs anywhere (local, cloud, home server).<br>- **Cost**: Cheapest (just pay for a single VPS). | - **Scaling**: Manual scaling (vertical only unless Swarm is used).<br>- **Resilience**: Single point of failure if not careful. | **Selected** |
| **Kubernetes (K8s)** | - **Scalability**: Infinite horizontal scaling.<br>- **Resilience**: Self-healing, zero-downtime deployments. | - **Complexity**: Overkill for a personal app/MVP.<br>- **Cost**: High management overhead (control plane). | Rejected |
| **Serverless (Vercel/AWS Lambda)** | - **Scale**: Scales to zero and infinity automatically.<br>- **Maintenance**: No server management. | - **Cold Starts**: Bad for real-time voice latency.<br>- **WebSockets**: Harder to maintain persistent connections (state management becomes complex). | Rejected |

**Decision**: **Docker Compose** on a generic VPS (e.g., Hetzner/DigitalOcean).
*Reasoning*: This allows for a "Self-Hosted First" philosophy. Users can run the entire "Second Brain" stack on their own hardware with a single `docker-compose up` command, ensuring data sovereignty.

