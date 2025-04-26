"use client";

import { useGetCurrentTime } from "@/lib/api";
import {
} from "@tanstack/react-query";


const CurrentTime = () => {
  const { data, isLoading, error } = useGetCurrentTime()

  if (isLoading) {
    return <div id="current-time">Loading...</div>;
  }
  if (error) {
    return <div id="current-time">Error: {error.message}</div>;
  }
  return <div id="current-time">{data?.currentTime}</div>;
};

export default CurrentTime;