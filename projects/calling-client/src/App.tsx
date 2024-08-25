/**
 * @author
 * @file App.tsx
 * @fileBase App
 * @path projects\calling-client\src\App.tsx
 * @from
 * @desc
 * @todo
 *
 *
 * @done
 * @example
 */

import React, { useState, useEffect, memo } from "react";
import { UA, WebSocketInterface } from "jssip";
const socket = new WebSocketInterface("wss://192.168.111.172");
const configuration = {
  sockets: [socket],
  uri: "sip:1234@example.com",
  password: "123456",
};
const ua = new UA(configuration);
ua.start();
// Register callbacks to desired call events
const eventHandlers = {
  progress: function () {
    console.log("call is in progress");
  },
  failed: function (e: unknown) {
    console.log("call failed with cause: " + e.data.cause);
  },
  ended: function (e: unknown) {
    console.log("call ended with cause: " + e.data.cause);
  },
  confirmed: function () {
    console.log("call confirmed");
  },
};
const options = {
  eventHandlers: eventHandlers,
  mediaConstraints: { audio: true, video: true },
};

const session = ua.call("sip:bob@example.com", options);
function App() {
  return <div>App</div>;
}

export default App;
