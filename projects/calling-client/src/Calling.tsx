/**
 * @author
 * @file Calling.tsx
 * @fileBase Calling
 * @path projects\calling-client\src\Calling.tsx
 * @from
 * @desc
 * @todo
 *
 *
 * @done
 * @example
 */

import { useState, useEffect, memo } from "react";

function Calling() {
  return (
    <div>
      <video id="local" autoplay playsinline muted></video>
      <video id="remote" autoplay playsinline></video>
    </div>
  );
}

export default Calling;
