-- backend/insert_initial_data.sql
--
-- This script populates the UserStatus, GrammarMastery, and VocabularyMastery
-- tables with initial data for testing and demonstration purposes.
--
-- To run this script, you can use a SQLite client or integrate it into your
-- application's initialization logic. For example:
--   sqlite3 test.db < insert_initial_data.sql

-- Initialize UserStatus if not already present
-- The user_id is fixed at 1
INSERT OR IGNORE INTO user_status (user_id, current_level, known_vocab_count, grammar_mastered_count, most_recent_weak_area)
VALUES (1, 'Beginner', 10, 5, 'Formal/Informal Speech');

-- Insert initial GrammarMastery patterns
-- weakness_flags are stored as JSON arrays
INSERT OR IGNORE INTO grammar_mastery (pattern, mastery_score, last_reviewed, weakness_flags, times_incorrect) VALUES
('-(으)ㅂ니다/습니다 (Formal ending)', 0.5, datetime('now', '-10 days'), '[]', 0),
('-아요/어요 (Informal polite ending)', 0.6, datetime('now', '-5 days'), '["conjugation errors"]', 1),
('-(으)ㄹ 수 있다/없다 (Can/Cannot)', 0.4, datetime('now', '-15 days'), '[]', 0),
('-고 싶다 (Want to)', 0.7, datetime('now', '-3 days'), '[]', 0),
('-(으)러 가다/오다 (Go/Come to do something)', 0.55, datetime('now', '-7 days'), '[]', 0),
('-지만 (but)', 0.3, datetime('now', '-20 days'), '["incorrect sentence linking"]', 2),
('-(으)면 (if/when)', 0.65, datetime('now', '-2 days'), '[]', 0),
('-때문에 (because of)', 0.48, datetime('now', '-12 days'), '[]', 0);


-- Insert initial VocabularyMastery words
INSERT OR IGNORE INTO vocabulary_mastery (word_korean, mastery_score, last_reviewed, times_correct, times_incorrect) VALUES
('안녕하세요', 0.9, datetime('now', '-1 days'), 10, 0),
('감사합니다', 0.85, datetime('now', '-2 days'), 8, 0),
('네', 0.95, datetime('now', '-1 days'), 15, 0),
('아니요', 0.9, datetime('now', '-2 days'), 12, 0),
('하다', 0.7, datetime('now', '-5 days'), 5, 1),
('먹다', 0.6, datetime('now', '-7 days'), 4, 2),
('가다', 0.75, datetime('now', '-4 days'), 6, 0),
('오다', 0.68, datetime('now', '-6 days'), 4, 1),
('공부하다', 0.5, datetime('now', '-10 days'), 2, 3),
('책', 0.8, datetime('now', '-3 days'), 7, 0),
('학생', 0.77, datetime('now', '-4 days'), 6, 0),
('선생님', 0.82, datetime('now', '-2 days'), 9, 0),
('학교', 0.71, datetime('now', '-6 days'), 5, 1);
