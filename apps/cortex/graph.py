from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

async def call_model(state, config):
    configuration = config.get("configurable", {})
    provider = configuration.get("provider", "openai")
    api_key = configuration.get("api_key")

    if not api_key:
        return {"messages": [SystemMessage(content="Error: API Key missing")]}

    try:
        if provider == "google":
            model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)
        else:
            # Default to OpenAI
            model = ChatOpenAI(model="gpt-3.5-turbo", api_key=api_key)

        response = await model.ainvoke(state["messages"])
        return {"messages": [response]}
    except Exception as e:
        return {"messages": [SystemMessage(content=f"Error calling model: {str(e)}")]}

workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.set_entry_point("agent")
workflow.add_edge("agent", END)

app = workflow.compile()
