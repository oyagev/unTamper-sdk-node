import { validateLogIngestionRequest, validateActor, validateTarget } from '../src/utils/validation';
import { ValidationError } from '../src/utils/errors';

describe('Validation', () => {
  describe('validateActor', () => {
    it('should validate correct actor', () => {
      const actor = {
        id: 'user123',
        type: 'user',
        display_name: 'John Doe',
      };

      expect(() => validateActor(actor)).not.toThrow();
    });

    it('should throw ValidationError for missing id', () => {
      const actor = {
        type: 'user',
        display_name: 'John Doe',
      } as any;

      expect(() => validateActor(actor)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing type', () => {
      const actor = {
        id: 'user123',
        display_name: 'John Doe',
      } as any;

      expect(() => validateActor(actor)).toThrow(ValidationError);
    });
  });

  describe('validateTarget', () => {
    it('should validate correct target', () => {
      const target = {
        id: 'doc123',
        type: 'document',
        display_name: 'Important Document',
      };

      expect(() => validateTarget(target)).not.toThrow();
    });

    it('should throw ValidationError for missing id', () => {
      const target = {
        type: 'document',
        display_name: 'Important Document',
      } as any;

      expect(() => validateTarget(target)).toThrow(ValidationError);
    });
  });

  describe('validateLogIngestionRequest', () => {
    it('should validate correct request', () => {
      const request = {
        action: 'user.login',
        actor: {
          id: 'user123',
          type: 'user',
          display_name: 'John Doe',
        },
        result: 'SUCCESS' as const,
        context: {
          request_id: 'req_123',
        },
        metadata: {
          version: '1.0.0',
        },
      };

      expect(() => validateLogIngestionRequest(request)).not.toThrow();
    });

    it('should throw ValidationError for missing action', () => {
      const request = {
        actor: {
          id: 'user123',
          type: 'user',
        },
      } as any;

      expect(() => validateLogIngestionRequest(request)).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty action', () => {
      const request = {
        action: '',
        actor: {
          id: 'user123',
          type: 'user',
        },
      };

      expect(() => validateLogIngestionRequest(request)).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid result', () => {
      const request = {
        action: 'user.login',
        actor: {
          id: 'user123',
          type: 'user',
        },
        result: 'INVALID_RESULT',
      } as any;

      expect(() => validateLogIngestionRequest(request)).toThrow(ValidationError);
    });
  });
});
