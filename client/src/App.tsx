import { useState, useEffect, useMemo } from 'react';
import { useAsync } from "react-use"
import './App.css';

import axios from 'axios';
import {
  For,
  Stack,
  StackSeparator,
  Text,
  Box,
  createListCollection 
} from '@chakra-ui/react';
import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import {
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from "@/components/ui/number-input"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { itemXLSXDownload, descriptorXLSXReader } from './utils/xlsx-util';

function App() {
  const descriptorInfoState = useAsync(async () => {
    return await descriptorXLSXReader('ELTA Descriptors.xlsx');
  }, []);

  const formSchema = z.object({
    level: z.string({ message: "CEFR Level is required" }).array(),
    descriptor: z.string({ message: "PELEx descriptor is required" }).array(),
    context: z.string({ message: "Context is required" }).array(),
    amount: z.string()
  });
  type FormValues = z.infer<typeof formSchema>
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });
  const [selectedLevel, selectedDescriptor, selectedContext] = 
    watch(["level", "descriptor", "context"]);

  const [item, setItem] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const descriptorInfo = useMemo(() => {
    return descriptorInfoState.value
  }, [descriptorInfoState.loading])

  const levels = useMemo(() => {
    return createListCollection({
      items: descriptorInfo ? Object.keys(descriptorInfo) : []
    })
  }, [descriptorInfo]);

  const descriptors = useMemo(() => {
    return createListCollection({
      items: selectedLevel ? Object.keys(descriptorInfo[selectedLevel[0]]) : []
    })
  }, [selectedLevel]);

  const contexts = useMemo(() => {
    if (!selectedDescriptor || !selectedLevel) {
      return createListCollection({ items: [] });
    }
    return createListCollection({
      items: descriptorInfo[selectedLevel[0]][selectedDescriptor[0]] || [],
    });
  }, [selectedDescriptor, selectedLevel, descriptorInfo]);
  

  const fetchItems = async (data) => {
    console.log('Submitting!');
    console.log(data)
    setIsGenerating(true);
    setItem(null); // Reset submission status before making the request
    const response = await axios.get('http://127.0.0.1:8080/api/texts', {
      params: {
        level: data.level[0],
        amount: data.amount,
        descriptor: data.descriptor[0],
        context: data.context[0],
      },
    });
    setIsGenerating(false);
    console.log(response.data);

    if (response.status == 200) {
      const result = await response.data;
      setItem(result);
    } else {
      throw new Error('Error submitting data');
    }
  };

  return (
    <>
      <Box
        width="800px"
        margin="0 auto"
        padding="16px"
        border="1px solid #e2e8f0"
        borderRadius="8px"
        boxShadow="md"
      >
        <form onSubmit={handleSubmit(fetchItems)}
        >
          <Stack gap="5">
            <Field label="CEFR Level" onChange={(value) => {
              console.log(selectedLevel);
              console.log(selectedContext);
              }}    
              invalid={!!errors.level}
              errorText={errors.level?.message}
            >
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <SelectRoot
                    name={field.name}
                    value={field.value}
                    onValueChange={({ value }) => {
                      setValue("descriptor", []); // Reset descriptor
                      setValue("context", []); // Reset context
                      field.onChange(value)}}
                    onInteractOutside={() => field.onBlur()}
                    collection={levels}
                  >
                  <SelectTrigger>
                    <SelectValueText placeholder='Select a level' />
                  </SelectTrigger>
                  <SelectContent>
                    {levels &&
                      levels.items.map((level: string) => (
                        <SelectItem item={level} key={level}>
                          {level}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </SelectRoot>
              )}/>
            </Field>
          
            <Field label="PELEx Descriptor"onChange={(value) => {
                console.log(selectedDescriptor);
                }}
                invalid={!!errors.descriptor}
                errorText={errors.descriptor?.message}
              >
                <Controller
                  name="descriptor"
                  control={control}
                  render={({ field }) => (
                    <SelectRoot
                      disabled={!!!selectedLevel}
                      name={field.name}
                      value={field.value}
                      onValueChange={({ value }) => {  
                        setValue("context", []); // Reset context
                        field.onChange(value)}}
                      onInteractOutside={() => field.onBlur()}
                      collection={descriptors}
                    >
                    <SelectTrigger>
                      <SelectValueText placeholder='Select a descriptor' />
                    </SelectTrigger>
                    <SelectContent>
                      {descriptors &&
                        descriptors.items.map(
                          (descriptor: string) => (
                          <SelectItem item={descriptor} key={descriptor}>
                            {descriptor}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </SelectRoot>
                )}/>
              </Field>
            
              <Field label="Context"onChange={(value) => {
                console.log(selectedContext);
                console.log(descriptorInfo);
                }}
                invalid={!!errors.context}
                errorText={errors.context?.message}
              >
                <Controller
                  name="context"
                  control={control}
                  render={({ field }) => (
                    <SelectRoot
                      disabled={!!!selectedDescriptor || selectedDescriptor.length == 0}
                      name={field.name}
                      value={field.value}
                      onValueChange={({ value }) => field.onChange(value)}
                      onInteractOutside={() => field.onBlur()}
                      collection={contexts}
                    >
                    <SelectTrigger>
                      <SelectValueText placeholder='Select a context' />
                    </SelectTrigger>
                    <SelectContent>
                      {contexts &&
                        contexts.items.map(
                          (context: string) => (
                          <SelectItem item={context} key={context}>
                            {context}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </SelectRoot>
                )}/>
              </Field>
              
              <Field label="Amount" onChange={(value) => {
                console.log(selectedContext);
                console.log(descriptorInfo);
                }}
                invalid={!!errors.amount}
                errorText={errors.amount?.message}
              >
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                  <NumberInputRoot
                    defaultValue="1" min={1} max={5}
                    name={field.name}
                    value={field.value}
                    onValueChange={({ value }) => {
                      field.onChange(value)
                    }}
                  >
                    <NumberInputField onBlur={field.onBlur} />
                  </NumberInputRoot>
                )}/>
              </Field>
              
              <Button
                variant="solid"
                backgroundColor="teal"
                disabled={!!!selectedContext || selectedContext.length == 0}
                loading={isGenerating} loadingText="Generating"
                type="submit"
                onClick={() => {console.log(errors)}}
              >
                Generate
              </Button>
            </Stack>
          </form>
      </Box>

      {item && (
        <Stack
          width="800px"
          margin="0 auto"
          mt={10}
          padding="16px"
          border="1px solid #e2e8f0"
          borderRadius="8px"
          boxShadow="md">
            <For each={item.results}>
              {(response, index) => (
                <Box borderWidth="1px" key={index} p="4">
                  <Text fontWeight="bold">Text #{index+1}</Text>
                  <Text fontWeight="bold">CEFR Level: {response.level}</Text>
                  <Text fontWeight="bold">PELEx Descriptor: {response.descriptor}</Text>
                  <Text fontWeight="bold">Context: {response.context}</Text>
                  <Text color="fg.muted">{response.text}</Text>
                </Box>
              )}
            </For>
          {/* <Button
            mt={4}
            colorScheme="teal"
            loadingText="Downloading"
            type="button"
            onClick={() => itemXLSXDownload(item)}
          >
            Download
          </Button> */}
        </Stack>
      )}
    </>
  );
}

export default App;
