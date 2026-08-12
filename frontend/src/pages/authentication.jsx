import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  CssBaseline,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';

import { AuthContext } from '../contexts/AuthContext';

export default function Authentication() {
  const [formState, setFormState] = useState(0); // 0 = login, 1 = register

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleAuth = async (e) => {
    e.preventDefault();

    setError('');

    try {
      if (formState === 0) {
        // LOGIN
        await handleLogin(username, password);
      } else {
        // REGISTER
        const result = await handleRegister(
          name,
          username,
          password
        );

        setMessage(result);
        setOpen(true);

        // Clear form
        setName('');
        setUsername('');
        setPassword('');

        // Switch back to login
        setFormState(0);
      }
    } catch (err) {
      console.error(err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong';

      setError(errorMessage);
    }
  };

  return (
    <>
      <CssBaseline />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 450,
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
          }}
        >
          <Stack spacing={3}>
            {/* Heading */}
            <Box textAlign="center">
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                {formState === 0 ? 'Welcome Back' : 'Create Account'}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {formState === 0
                  ? 'Sign in to your video conferencing account'
                  : 'Create your video conferencing account'}
              </Typography>
            </Box>

            {/* Login / Register buttons */}
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant={formState === 0 ? 'contained' : 'outlined'}
                onClick={() => {
                  setFormState(0);
                  setError('');
                }}
              >
                Sign In
              </Button>

              <Button
                fullWidth
                variant={formState === 1 ? 'contained' : 'outlined'}
                onClick={() => {
                  setFormState(1);
                  setError('');
                }}
              >
                Sign Up
              </Button>
            </Stack>

            {/* Authentication form */}
            <Box component="form" onSubmit={handleAuth}>
              <Stack spacing={2.5}>
                {/* Name - Register only */}
                {formState === 1 && (
                  <TextField
                    label="Full Name"
                    fullWidth
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}

                {/* Username */}
                <TextField
                  label="Username"
                  type="text"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                {/* Password */}
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Error */}
                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.4,
                    fontSize: '1rem',
                    textTransform: 'none',
                  }}
                >
                  {formState === 0 ? 'Sign In' : 'Create Account'}
                </Button>
              </Stack>
            </Box>

            {/* Bottom text */}
            <Typography
              textAlign="center"
              variant="body2"
            >
              {formState === 0
                ? "Don't have an account? "
                : 'Already have an account? '}

              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => {
                  setFormState(formState === 0 ? 1 : 0);
                  setError('');
                }}
              >
                {formState === 0 ? 'Sign Up' : 'Sign In'}
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Success message */}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert
          severity="success"
          onClose={() => setOpen(false)}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
