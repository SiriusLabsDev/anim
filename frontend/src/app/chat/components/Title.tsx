"use client"
import { useHistoryStore } from "@/store/useHistoryStore";
import { useEffect } from "react";

interface Props {
    id?: string;
}
const Title: React.FC<Props> = ({ id }) => {
  const { history } = useHistoryStore();

  useEffect(() => {
    console.log(id);
    if(!id) document.title = "Chat";
    else {
      document.title = history.find((element) => element.id === id)?.title!;
    }
  }, [id])
  return (
    <></>
  )
}

export default Title;
