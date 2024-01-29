import React, { useEffect } from "react";

// Custom modules
import Container from "./Container";

function Page(props) {
  useEffect(() => {
    document.title = `${props.title} | TMS`;
    window.scrollTo(0, 0);
  }, [props.title]);

  return <Container width={props.width}>{props.children}</Container>;
}

export default Page;
