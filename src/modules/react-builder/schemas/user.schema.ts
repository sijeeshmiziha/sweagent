/**
 * User-related schemas - same as .ref/core/react/zodTypes.ts
 */

import { z } from 'zod';

export const LoginInputSchema = z.object({
  email: z.email().describe("User's email address, must be valid format"),
  password: z.string().min(8).describe("User's password, minimum length of 8"),
});

export const SpecializationSchema = z.object({
  _id: z.string().describe('Unique identifier of the specialization, type: string'),
  title: z.string().describe('Display title for the specialization, type: string'),
});

export const UserSchema = z.object({
  _id: z.string().describe('Unique ID of the user, type: string'),
  firstName: z.string().min(2).max(30).describe('First name, 2-30 characters, type: string'),
  lastName: z.string().min(2).max(30).describe('Last name, 2-30 characters, type: string'),
  email: z.email().describe('Email address in valid format, type: string'),
  phoneNumber: z.string().min(10).describe("User's phone number, at least 10 digits, type: string"),
  profileImage: z
    .string()
    .optional()
    .describe("Optional URL to user's profile image, type: string, optional"),
  role: z
    .enum(['ADMIN', 'TRAINER', 'CLIENT'])
    .describe("User's role in the system (ADMIN, TRAINER, CLIENT)"),
  rate: z
    .number()
    .min(1)
    .optional()
    .describe("User's rate (e.g., hourly, etc.), type: number, optional"),
  specializations: z
    .array(SpecializationSchema)
    .optional()
    .describe('Array of specialization objects, optional'),
  languages: z
    .array(z.string())
    .optional()
    .describe('Array of languages the user speaks, type: string[], optional'),
  about: z
    .string()
    .min(20)
    .max(500)
    .optional()
    .describe('Brief bio or description (20-500 chars), type: string, optional'),
  gender: z.string().optional().describe("User's gender, type: string, optional"),
  timezone: z.string().optional().describe("User's timezone, type: string, optional"),
  averageRating: z
    .number()
    .optional()
    .describe('Average rating for this user, type: number, optional'),
});

export const CreateUserInputSchema = z.object({
  firstName: z.string().min(2).max(30).describe('First name, 2-30 characters, type: string'),
  lastName: z.string().min(2).max(30).describe('Last name, 2-30 characters, type: string'),
  email: z.email().describe('Valid email for the new user, type: string'),
  phoneNumber: z.string().min(10).describe('Phone number (at least 10 digits), type: string'),
  password: z.string().min(8).describe('Password with min length 8, type: string'),
  role: z
    .enum(['ADMIN', 'TRAINER', 'CLIENT'])
    .describe('Role of the new user (ADMIN, TRAINER, CLIENT)'),
  rate: z.number().min(1).optional().describe('Rate for the new user, type: number, optional'),
  specializationIds: z
    .array(z.string())
    .min(1)
    .optional()
    .describe('Array of specialization IDs, optional'),
  languages: z
    .array(z.string())
    .min(1)
    .optional()
    .describe('List of languages user speaks, optional'),
  about: z
    .string()
    .min(20)
    .max(500)
    .optional()
    .describe("User's about/bio field, 20-500 chars, optional"),
});

export const UpdateUserInputSchema = z.object({
  _id: z.string().describe('ID of the user to be updated, type: string'),
  firstName: z
    .string()
    .min(2)
    .max(30)
    .optional()
    .describe('Updated first name, type: string, optional'),
  lastName: z
    .string()
    .min(2)
    .max(30)
    .optional()
    .describe('Updated last name, type: string, optional'),
  email: z.email().optional().describe('Updated email, type: string, optional'),
  phoneNumber: z
    .string()
    .min(10)
    .optional()
    .describe('Updated phone number, at least 10 digits, optional'),
  rate: z.number().min(1).optional().describe('Updated rate, type: number, optional'),
  specializationIds: z
    .array(z.string())
    .min(1)
    .optional()
    .describe('Updated array of specialization IDs, optional'),
  languages: z.array(z.string()).min(1).optional().describe('Updated list of languages, optional'),
  about: z
    .string()
    .min(20)
    .max(500)
    .optional()
    .describe('Updated about/bio (20-500 chars), optional'),
});

export const ForgotPasswordSchema = z.object({
  email: z.email().describe('Email to initiate the password reset process, type: string'),
});

export const ResetPasswordSchema = z.object({
  type: z.enum(['EMAIL', 'SMS']).describe('How the reset code was sent (EMAIL or SMS)'),
  resetTicket: z.string().describe('Token/ticket to validate the reset request, type: string'),
  newPassword: z.string().min(8).describe('The new password, min length 8, type: string'),
});

export type TLoginInputSchema = z.infer<typeof LoginInputSchema>;
export type TUserSchema = z.infer<typeof UserSchema>;
export type TSpecializationSchema = z.infer<typeof SpecializationSchema>;
export type TCreateUserInputSchema = z.infer<typeof CreateUserInputSchema>;
export type TUpdateUserInputSchema = z.infer<typeof UpdateUserInputSchema>;
export type TForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;
export type TResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
