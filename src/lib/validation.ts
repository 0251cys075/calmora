/**
 * @file validation.ts
 * @description Zod-based request validation schemas and helper types for the Calmora client and API.
 * Ensures consistent checking of login, registration, journals, habits, mood logs, and AI companion messages.
 */

import { z } from "zod"

/* ==========================================================================
   AUTHENTICATION VALIDATION SCHEMAS
   ========================================================================== */

/**
 * Validation schema for new user registrations.
 * Requires name, valid email, and secure password.
 */
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  email: z.string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

/**
 * Validation schema for user login requests.
 */
export const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, "Password is required"),
})

/* ==========================================================================
   JOURNAL VALIDATION SCHEMAS
   ========================================================================== */

/**
 * Validation schema for journal entries.
 */
export const journalEntrySchema = z.object({
  content: z.string()
    .min(10, "Journal entry must be at least 10 characters")
    .max(10000, "Journal entry must be less than 10,000 characters")
    .trim(),
  title: z.string()
    .max(100, "Title must be less than 100 characters")
    .optional(),
  mood: z.number()
    .min(1, "Mood must be between 1 and 5")
    .max(5, "Mood must be between 1 and 5")
    .optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  isGratitude: z.boolean().optional(),
})

/* ==========================================================================
   HABIT VALIDATION SCHEMAS
   ========================================================================== */

/**
 * Validation schema for habits configuration.
 */
export const habitSchema = z.object({
  name: z.string()
    .min(2, "Habit name must be at least 2 characters")
    .max(50, "Habit name must be less than 50 characters")
    .trim(),
  icon: z.string().optional(),
  color: z.string().optional(),
  time: z.string().optional(),
})

/* ==========================================================================
   MOOD VALIDATION SCHEMAS
   ========================================================================== */

/**
 * Validation schema for mood tracking logs.
 */
export const moodEntrySchema = z.object({
  mood: z.number()
    .min(1, "Mood must be between 1 and 5")
    .max(5, "Mood must be between 1 and 5"),
  note: z.string()
    .max(500, "Note must be less than 500 characters")
    .optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
})

/* ==========================================================================
   CHAT VALIDATION SCHEMAS
   ========================================================================== */

/**
 * Validation schema for messages sent to the Calmora AI wellness companion.
 */
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),
  mode: z.enum(["listener", "coach", "motivation", "cbt", "meditation", "productivity", "student"]).optional(),
})

/* ==========================================================================
   SCHEMA TYPE INFERENCES
   ========================================================================== */

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type JournalEntryInput = z.infer<typeof journalEntrySchema>
export type HabitInput = z.infer<typeof habitSchema>
export type MoodEntryInput = z.infer<typeof moodEntrySchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>

/* ==========================================================================
   VALIDATION ENGINE HELPER
   ========================================================================== */

/**
 * Generic helper to validate data objects against any Zod schema.
 * Formats errors nicely mapping each error to its corresponding object key path.
 * @param schema - ZodSchema target
 * @param data - The raw input data to validate
 * @returns Success status and parsed data or success failure status and errors mapping
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err: any) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}
