// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/repositories/__tests__/ProfileRepository.test.ts
// Description: Unit tests for ProfileRepository
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { ProfileRepository } from '../ProfileRepository';
import { IndexedDBService } from '../../database/IndexedDBService';
import { ProfileCategory, CreateProfileInput } from '@/types/profile.types';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let dbService: IndexedDBService;

  beforeEach(async () => {
    dbService = IndexedDBService.getInstance();
    await dbService.initialize();
    await dbService.clear(); // Clean slate for each test
    repository = new ProfileRepository(dbService);
  });

  afterEach(async () => {
    await dbService.clear();
  });

  describe('create', () => {
    it('should create a new profile with generated ID and timestamps', async () => {
      const input: CreateProfileInput = {
        name: 'Deep Work',
        description: 'Focused work session',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      const profile = await repository.create(input);

      expect(profile.id).toBeDefined();
      expect(profile.name).toBe('Deep Work');
      expect(profile.category).toBe(ProfileCategory.WORK);
      expect(profile.durationMinutes).toBe(25);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should create multiple profiles with unique IDs', async () => {
      const input1: CreateProfileInput = {
        name: 'Work Session',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      const input2: CreateProfileInput = {
        name: 'Study Session',
        category: ProfileCategory.STUDY,
        durationMinutes: 50,
        breakDurationMinutes: 10,
        longBreakDurationMinutes: 20,
        breakFrequency: 3,
        aiCoachingEnabled: true,
      };

      const profile1 = await repository.create(input1);
      const profile2 = await repository.create(input2);

      expect(profile1.id).not.toBe(profile2.id);
    });
  });

  describe('findById', () => {
    it('should find an existing profile by ID', async () => {
      const input: CreateProfileInput = {
        name: 'Test Profile',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      const created = await repository.create(input);
      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Test Profile');
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no profiles exist', async () => {
      const profiles = await repository.findAll();
      expect(profiles).toEqual([]);
    });

    it('should return all created profiles', async () => {
      const input1: CreateProfileInput = {
        name: 'Profile 1',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      const input2: CreateProfileInput = {
        name: 'Profile 2',
        category: ProfileCategory.STUDY,
        durationMinutes: 50,
        breakDurationMinutes: 10,
        longBreakDurationMinutes: 20,
        breakFrequency: 3,
        aiCoachingEnabled: false,
      };

      await repository.create(input1);
      await repository.create(input2);

      const profiles = await repository.findAll();
      expect(profiles).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update profile fields', async () => {
      const input: CreateProfileInput = {
        name: 'Original Name',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      const created = await repository.create(input);
      await new Promise((resolve) => setTimeout(resolve, 5));
      const updated = await repository.update(created.id, {
        name: 'Updated Name',
        durationMinutes: 30,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.durationMinutes).toBe(30);
      expect(updated.category).toBe(ProfileCategory.WORK); // Unchanged
      expect(updated.createdAt).toEqual(created.createdAt); // Preserved
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        created.updatedAt.getTime()
      ); // Updated timestamp
    });

    it('should throw error when updating non-existent profile', async () => {
      await expect(
        repository.update('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('Profile with id non-existent-id not found');
    });
  });

  describe('delete', () => {
    it('should delete an existing profile', async () => {
      const input: CreateProfileInput = {
        name: 'To Delete',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      const created = await repository.create(input);
      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByCategory', () => {
    it('should return profiles filtered by category', async () => {
      const workProfile: CreateProfileInput = {
        name: 'Work',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      const studyProfile: CreateProfileInput = {
        name: 'Study',
        category: ProfileCategory.STUDY,
        durationMinutes: 50,
        breakDurationMinutes: 10,
        longBreakDurationMinutes: 20,
        breakFrequency: 3,
        aiCoachingEnabled: true,
      };

      await repository.create(workProfile);
      await repository.create(studyProfile);
      await repository.create(workProfile); // Second work profile

      const workProfiles = await repository.findByCategory(ProfileCategory.WORK);
      expect(workProfiles).toHaveLength(2);
      expect(workProfiles.every((p) => p.category === ProfileCategory.WORK)).toBe(true);
    });
  });

  describe('count', () => {
    it('should return correct count of profiles', async () => {
      expect(await repository.count()).toBe(0);

      const input: CreateProfileInput = {
        name: 'Profile',
        category: ProfileCategory.WORK,
        durationMinutes: 25,
        breakDurationMinutes: 5,
        longBreakDurationMinutes: 15,
        breakFrequency: 4,
        aiCoachingEnabled: true,
      };

      await repository.create(input);
      expect(await repository.count()).toBe(1);

      await repository.create(input);
      expect(await repository.count()).toBe(2);
    });
  });
});