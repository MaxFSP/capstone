"use client";

import { Button } from "@nextui-org/button";
const onChanges = () => {
  console.log("hi");
};
function CreateUser() {
  return (
    <Button color="primary" onClick={onChanges}>
      Crear nuevo usuario
    </Button>
  );
}

export default CreateUser;
