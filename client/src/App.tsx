import { useState, useEffect } from 'react';
import './App.css';

import axios from 'axios';
import {
  Button,
  IconButton,
  Container,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select,
  ChakraProvider,
  Textarea,
  Box,
} from '@chakra-ui/react';

import { FaDownload } from 'react-icons/fa6';

import { Field, Form, Formik } from 'formik';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { itemXLSXDownload, descriptorXLSXReader } from './utils/xlsx-util';

function App() {
  useEffect(() => {
    const asyncDescriptorWrapper = async () => {
      const result = await descriptorXLSXReader('CEFR Descriptors (2020).xlsx');
      console.log(result);
      setDescriptorInfo(result);
    };
    asyncDescriptorWrapper();
  }, []);

  const [item, setItem] = useState(null);
  const [descriptorInfo, setDescriptorInfo] = useState(null);

  const fetchItems = async (values: {
    text: string;
    level: string;
    amount: number;
    descriptor: string;
  }) => {
    setItem(null); // Reset submission status before making the request
    const response = await axios.get('http://127.0.0.1:8080/api/items', {
      params: {
        text: values.text,
        level: values.level,
        amount: values.amount,
        descriptor: values.descriptor,
      },
    });
    console.log(response.data);

    if (response.status == 200) {
      const result = await response.data.res;
      setItem(result);
    } else {
      throw new Error('Error submitting data');
    }
  };

  const validateText = (text: string) => {
    let error;
    if (!text) {
      error = 'Ingrese texto válido';
    }
    return error;
  };

  return (
    <>
      <ChakraProvider>
        <Box
          width="800px"
          margin="0 auto"
          padding="16px"
          border="1px solid #e2e8f0"
          borderRadius="8px"
          boxShadow="md"
        >
          <Formik
            initialValues={{ text: '', amount: 1 }}
            onSubmit={async (values, actions) => {
              await fetchItems(values);
              actions.setSubmitting(false);
            }}
          >
            {(props) => (
              <Form>
                <Field name="text" validate={validateText}>
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.text && form.touched.text}
                      marginBottom="16px"
                    >
                      <FormLabel>Texto</FormLabel>
                      <Textarea
                        {...field}
                        placeholder="Inserte el texto aquí..."
                        size="lg" // predefined sizes: "xs", "sm", "md", "lg"
                        height="300px" // custom height to make it larger
                        padding="12px" // custom padding
                        overflow="auto" // ensures that overflow text can be scrolled
                      />
                      <FormErrorMessage>{form.errors.text}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="level">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.level && form.touched.level}
                      marginBottom="16px"
                    >
                      <FormLabel>Nivel CEFR</FormLabel>
                      <Select {...field} placeholder="Seleccione un nivel">
                        onChange=
                        {(e) => {
                          const selectedLevel = e.target.value;
                          props.setFieldValue('level', selectedLevel);
                          props.setFieldValue('descriptor', ''); // Reset descriptor
                        }}
                        {descriptorInfo &&
                          descriptorInfo.Level.map((level) => {
                            return <option>{level}</option>;
                          })}
                      </Select>
                      <FormErrorMessage>{form.errors.level}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="descriptor">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={
                        form.errors.descriptor && form.touched.descriptor
                      }
                      marginBottom="16px"
                    >
                      <FormLabel>Descriptor</FormLabel>
                      <Select
                        {...field}
                        placeholder="Seleccione un descriptor"
                        isDisabled={!form.values.level}
                      >
                        {descriptorInfo &&
                          descriptorInfo.Descriptor[form.values.level]?.map(
                            (descriptor) => {
                              return <option>{descriptor}</option>;
                            },
                          )}
                      </Select>
                      <FormErrorMessage>{form.errors.level}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="amount">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.amount && form.touched.amount}
                      marginBottom="16px"
                    >
                      <FormLabel>Cantidad de items</FormLabel>
                      <Flex>
                        <NumberInput
                          {...field}
                          min={1}
                          max={10}
                          defaultValue={1}
                          maxW="100px"
                          mr="2rem"
                          value={props.values.amount}
                          isDisabled={true}
                          onChange={(value) =>
                            props.setFieldValue('amount', value)
                          }
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Slider
                          {...field}
                          flex="1"
                          focusThumbOnChange={false}
                          value={props.values.amount}
                          isDisabled={true}
                          onChange={(value) =>
                            props.setFieldValue('amount', value)
                          }
                          min={1}
                          max={10}
                          defaultValue={1}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb
                            fontSize="sm"
                            boxSize="32px"
                            children={props.values.amount}
                          />
                        </Slider>
                      </Flex>
                      <FormErrorMessage>{form.errors.amount}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Button
                  mt={4}
                  colorScheme="teal"
                  isDisabled={!props.values.level || !props.values.descriptor}
                  isLoading={props.isSubmitting}
                  loadingText="Generando"
                  type="submit"
                >
                  Generar
                </Button>
              </Form>
            )}
          </Formik>
        </Box>

        {item && (
          <div>
            <IconButton
              colorScheme="teal"
              aria-label="Call Segun"
              size="lg"
              margin={2}
              onClick={itemXLSXDownload(item)}
              icon={<FaDownload />}
            />
            <Box
              mt={4}
              width="800px"
              margin="0 auto"
              padding="16px"
              border="1px solid #e2e8f0"
              borderRadius="8px"
              boxShadow="md"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
            </Box>
          </div>
        )}
      </ChakraProvider>
    </>
  );
}

export default App;
