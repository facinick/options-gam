"use client";

import {
  useQuery,
} from "@tanstack/react-query";

const getCurrentTime = async () => {
  const response = await fetch("/api/time");
  if (!response.ok) {
    throw new Error("Failed to fetch current time");
  }
  const data = await response.json();
  return data.time;
};

const CurrentTime = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentTime"],
    queryFn: getCurrentTime,
    refetchInterval: 1000,
});
if (isLoading) {
return <div id="current-time">Loading...</div>;
}
if (error) {
return <div id="current-time">Error: {error.message}</div>;
}
return <div id="current-time">{data}</div>;
};

export default CurrentTime;