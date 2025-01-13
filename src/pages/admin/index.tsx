import { type NextPageWithLayout } from "~/pages/_app";
import { AdminLayout } from "~/components/Global/Layout";
import { AuthRequired } from "~/components/Global/AuthRequired";
import { Center, Flex, Text } from "@chakra-ui/react";
import {RoleSets} from "~/common/roles";

const Admin: NextPageWithLayout = () => {
  return (
    <AuthRequired roles={RoleSets.users}>
      <Center h={"85vh"}>
        <Flex
          direction={"column"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Text
            as={"b"}
            fontSize={{ md: "7xl", base: "5xl" }}
            color={"darkblue.400"}
          >
            Admin
          </Text>
        </Flex>
      </Center>
    </AuthRequired>
  );
};


Admin.getLayout = (page) => <AdminLayout>{page}</AdminLayout>

export default Admin;
