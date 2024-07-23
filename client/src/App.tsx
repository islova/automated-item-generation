import { useState, useEffect } from 'react'
import './App.css'

import axios from 'axios';
import {
  Button,
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
  ChakraProvider } from '@chakra-ui/react';

import { Field, Form, Formik } from 'formik';

function App() {
  const fetchItems = async (values: {text: string, band: string, amount: number}) => {
    const response = await axios.get('http://127.0.0.1:8080/api/items', {
      params: {
        'text': values.text,
        'band': values.band,
        'amount': values.amount
      }
    });
    console.log(response.data);
  }

  const validateText = (text: string) => {
    let error;
    if (!text) {
      error = "Ingrese texto válido"
    }
    return error
  }

  return (
    <>
      <ChakraProvider>
        <Formik
        initialValues={{ text: '', band: 'A1', amount: 1 }}
        onSubmit={async (values, actions) => {
          await fetchItems(values);
          actions.setSubmitting(false)
        }}>
        {(props) => (
          <Form>
            <Field name='text' validate={validateText}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.text && form.touched.text}>
                  <FormLabel>Texto</FormLabel>
                  <Input {...field} placeholder='Inserte el texto aquí...'/>
                  <FormErrorMessage>{form.errors.text}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Field name='band'>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.band && form.touched.band}>
                  <FormLabel>Banda CERF</FormLabel>
                  <Select {...field} placeholder='Seleccione una banda'>
                    <option>A1</option>
                    <option>A2</option>
                    <option>B1</option>
                    <option>B2</option>
                    <option>C1</option>
                    <option>C2</option>
                  </Select>
                  <FormErrorMessage>{form.errors.band}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Field name='amount'>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.amount && form.touched.amount}>
                  <FormLabel>Cantidad de items</FormLabel>
                  <Flex>
                    <NumberInput {...field} min={1} max={50} defaultValue={1} maxW='100px' mr='2rem' value={props.values.amount} onChange={(value) => props.setFieldValue('amount', value)}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Slider {...field}
                      flex='1'
                      focusThumbOnChange={false}
                      value={props.values.amount}
                      onChange={(value) => props.setFieldValue('amount', value)}
                      min={1} max={50}
                      defaultValue={1}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb fontSize='sm' boxSize='32px' children={props.values.amount} />
                    </Slider>
                  </Flex>
                  <FormErrorMessage>{form.errors.amount}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Button
              mt={4}
              colorScheme='teal'
              isLoading={props.isSubmitting}
              type='submit'
            >
              Generar
            </Button>
          </Form>
        )}
        </Formik>
      </ChakraProvider>
    </>
  )
}

export default App
