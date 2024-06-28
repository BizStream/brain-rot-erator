import { useEffect, useState } from "react";
import io from "socket.io-client";

const useSocket = (url, event) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const socket = io(url);

    socket.on(event, (data) => {
      setData(data);
    });

    return () => {
      socket.off(event);
      socket.close();
    };
  }, [url, event]);

  return data;
};

export default useSocket;
