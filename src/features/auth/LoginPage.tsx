import { useCallback, useId } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { VisuallyHidden } from 'reakit/VisuallyHidden';
import { Box, Button, Divider, Flex, Label, Paragraph } from 'theme-ui';
import { Logo } from '../navigation/Logo';
import { FormField } from '../ui/FormField';
import { InputField } from '../ui/forms/InputField';
import { Icons } from '../ui/Icons';
import { SubmitButton } from '../ui/SubmitButton';
import {
  createUser,
  signInUser,
  signInWithGithub,
  signInWithGoogle,
} from './services/auth.firebase';

type FormValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { control, getValues, formState, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    (values: unknown) => {
      const { email, password } = getValues();

      signInUser(email, password).catch((error) => {
        toast.error(`Invalid credentials.\n${error.message}`);
      });
    },
    [getValues],
  );

  const handleRegister = useCallback(() => {
    const { email, password } = getValues();

    createUser(email, password).catch((error) => {
      toast.error(`Cannot create user.\n${error.message}`);
    });
  }, [getValues]);

  const handleGoogle = useCallback(() => signInWithGoogle(), []);
  const handleGithub = useCallback(() => signInWithGithub(), []);

  const emailId = useId();
  const passwordId = useId();

  return (
    <Box>
      <Logo />
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField>
          <Label htmlFor={emailId}>Email</Label>
          <InputField
            id={emailId}
            type="email"
            name="email"
            control={control}
            rules={{ required: 'This field is required' }}
          />
        </FormField>
        <FormField>
          <Label htmlFor={passwordId}>Password</Label>
          <InputField
            id={passwordId}
            type="password"
            name="password"
            control={control}
            rules={{ required: 'This field is required' }}
          />
        </FormField>

        <Flex sx={{ flexDirection: 'column', gap: [3] }}>
          <SubmitButton type="submit" isSubmitting={formState.isSubmitting}>
            Sign in
          </SubmitButton>

          <SubmitButton
            type="button"
            variant="secondary"
            isSubmitting={formState.isSubmitting}
            onClick={handleRegister}
          >
            Register
          </SubmitButton>
        </Flex>
      </form>

      <Divider />

      <Flex sx={{ flexDirection: 'column', gap: [2] }}>
        <Paragraph sx={{ textAlign: 'center' }}>Or continue with</Paragraph>
        <Button type="button" sx={{ bg: '#DB4437', color: 'white' }} onClick={handleGoogle}>
          <VisuallyHidden>Google</VisuallyHidden>
          <Icons name="google" />
        </Button>
        <Button type="button" sx={{ bg: '#000', color: 'white' }} onClick={handleGithub}>
          <VisuallyHidden>GitHub</VisuallyHidden>
          <Icons name="github" />
        </Button>
      </Flex>
    </Box>
  );
}
