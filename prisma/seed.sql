-- シードデータの挿入
-- SupabaseのSQLエディタで実行してください

-- 既存のデータを削除（オプション：既存データがある場合）
-- DELETE FROM likes;
-- DELETE FROM follows;
-- DELETE FROM posts;
-- DELETE FROM users;

-- 1. ユーザーデータの挿入
INSERT INTO users (id, email, username, "displayName", bio, "profileImage", "headerImage", location, website, birthdate, created_at, updated_at)
VALUES
  ('user1', 'alice@example.com', 'alice', 'Alice', 'Hello, I am Alice!', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 'https://picsum.photos/800/200?random=1', 'Tokyo, Japan', 'https://alice.dev', '1994-04-15', '2024-01-01 00:00:00', NOW()),
  ('user2', 'bob@example.com', 'bob', 'Bob', 'Developer and tech enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 'https://picsum.photos/800/200?random=2', 'Osaka, Japan', 'https://bob.codes', '1992-08-05', '2024-01-02 00:00:00', NOW()),
  ('user3', 'charlie@example.com', 'charlie', 'Charlie', 'Designer and artist', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', 'https://picsum.photos/800/200?random=3', 'Fukuoka, Japan', 'https://charlie.art', '1996-12-22', '2024-01-03 00:00:00', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. 投稿データの挿入（返信以外）
INSERT INTO posts (id, user_id, content, image_url, reply_to_id, reply_to_user_id, created_at, updated_at)
VALUES
  ('post1', 'user1', 'Hello, world! This is my first post. #excited', NULL, NULL, NULL, NOW() - INTERVAL '1 hour', NOW()),
  ('post2', 'user2', 'Just finished working on a new project. Can''t wait to share it with everyone!', NULL, NULL, NULL, NOW() - INTERVAL '2 hours', NOW()),
  ('post3', 'user3', 'Beautiful sunset today! 🌅', 'https://picsum.photos/800/600?random=sunset', NULL, NULL, NOW() - INTERVAL '3 hours', NOW()),
  ('post4', 'user1', 'Check out this amazing view!', 'https://picsum.photos/800/600?random=mountain', NULL, NULL, NOW() - INTERVAL '4 hours', NOW()),
  ('post5', 'user2', 'Working on something exciting! 🚀', 'https://picsum.photos/800/600?random=tech', NULL, NULL, NOW() - INTERVAL '5 hours', NOW()),
  ('post6', 'user3', '今日は良い天気ですね！散歩に行ってきました。', 'https://picsum.photos/800/600?random=walk', NULL, NULL, NOW() - INTERVAL '6 hours', NOW()),
  ('post7', 'user1', '新しい本を読み始めました。とても面白いです！', NULL, NULL, NULL, NOW() - INTERVAL '7 hours', NOW()),
  ('post8', 'user2', 'コーヒーを飲みながらコーディング中 ☕', 'https://picsum.photos/800/600?random=coffee', NULL, NULL, NOW() - INTERVAL '8 hours', NOW()),
  ('post9', 'user3', '週末の計画を立てています。どこに行こうかな？', NULL, NULL, NULL, NOW() - INTERVAL '9 hours', NOW()),
  ('post10', 'user1', '美味しいランチを食べました！🍽️', 'https://picsum.photos/800/600?random=food', NULL, NULL, NOW() - INTERVAL '10 hours', NOW()),
  ('post11', 'user2', '今日学んだことをシェアします。React Hooksは本当に便利ですね！', NULL, NULL, NULL, NOW() - INTERVAL '11 hours', NOW()),
  ('post12', 'user3', 'アート作品を作成中です。完成が楽しみ！', 'https://picsum.photos/800/600?random=art', NULL, NULL, NOW() - INTERVAL '12 hours', NOW()),
  ('post13', 'user1', '朝の散歩は気持ちいいですね。🌅', 'https://picsum.photos/800/600?random=morning', NULL, NULL, NOW() - INTERVAL '13 hours', NOW()),
  ('post14', 'user2', '新しいプロジェクトを始めました。ワクワクしています！', NULL, NULL, NULL, NOW() - INTERVAL '14 hours', NOW()),
  ('post15', 'user3', '音楽を聴きながら作業しています。🎵', NULL, NULL, NULL, NOW() - INTERVAL '15 hours', NOW()),
  ('post16', 'user1', '今日は運動をしました。気分がスッキリ！', 'https://picsum.photos/800/600?random=exercise', NULL, NULL, NOW() - INTERVAL '16 hours', NOW()),
  ('post17', 'user2', 'コードレビューをしています。良いコードを書くのは難しいですね。', NULL, NULL, NULL, NOW() - INTERVAL '17 hours', NOW()),
  ('post18', 'user3', '新しいデザインのアイデアが浮かびました！', 'https://picsum.photos/800/600?random=design', NULL, NULL, NOW() - INTERVAL '18 hours', NOW()),
  ('post19', 'user1', '友達と会って楽しい時間を過ごしました。', NULL, NULL, NULL, NOW() - INTERVAL '19 hours', NOW()),
  ('post20', 'user2', 'バグを修正しました。やっと動くようになった！', NULL, NULL, NULL, NOW() - INTERVAL '20 hours', NOW()),
  ('post21', 'user3', '今日の夕日が綺麗でした。🌇', 'https://picsum.photos/800/600?random=sunset2', NULL, NULL, NOW() - INTERVAL '21 hours', NOW()),
  ('post22', 'user1', '読書の時間。静かな時間が好きです。', 'https://picsum.photos/800/600?random=book', NULL, NULL, NOW() - INTERVAL '22 hours', NOW()),
  ('post23', 'user2', '新しい技術を学んでいます。毎日が勉強ですね。', NULL, NULL, NULL, NOW() - INTERVAL '23 hours', NOW()),
  ('post24', 'user3', 'カフェで作業中。集中できます。', 'https://picsum.photos/800/600?random=cafe', NULL, NULL, NOW() - INTERVAL '24 hours', NOW()),
  ('post25', 'user1', '週末は何をしようかな？', NULL, NULL, NULL, NOW() - INTERVAL '25 hours', NOW()),
  ('post26', 'user2', 'オープンソースプロジェクトに貢献しました！', 'https://picsum.photos/800/600?random=code', NULL, NULL, NOW() - INTERVAL '26 hours', NOW()),
  ('post27', 'user3', '新しいアートスタイルを試しています。', NULL, NULL, NULL, NOW() - INTERVAL '27 hours', NOW()),
  ('post28', 'user1', '美味しいケーキを食べました！🍰', 'https://picsum.photos/800/600?random=cake', NULL, NULL, NOW() - INTERVAL '28 hours', NOW()),
  ('post29', 'user2', 'テストを書いています。品質を保つために重要ですね。', NULL, NULL, NULL, NOW() - INTERVAL '29 hours', NOW()),
  ('post30', 'user3', '今日のインスピレーション。', 'https://picsum.photos/800/600?random=inspiration', NULL, NULL, NOW() - INTERVAL '30 hours', NOW()),
  ('post31', 'user1', '朝のルーティンを確立しました。生産性が上がります！', NULL, NULL, NULL, NOW() - INTERVAL '31 hours', NOW()),
  ('post32', 'user2', '新しいライブラリを試しています。便利そう！', 'https://picsum.photos/800/600?random=library', NULL, NULL, NOW() - INTERVAL '32 hours', NOW()),
  ('post33', 'user3', 'デザインの勉強会に参加しました。学びが多かったです。', NULL, NULL, NULL, NOW() - INTERVAL '33 hours', NOW()),
  ('post34', 'user1', '今日のランチ。美味しかった！', 'https://picsum.photos/800/600?random=lunch', NULL, NULL, NOW() - INTERVAL '34 hours', NOW()),
  ('post35', 'user2', 'コードをリファクタリングしました。読みやすくなった！', NULL, NULL, NULL, NOW() - INTERVAL '35 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. 返信の挿入（post1への返信）
INSERT INTO posts (id, user_id, content, image_url, reply_to_id, reply_to_user_id, created_at, updated_at)
VALUES
  ('reply1', 'user2', 'Great post, Alice!', NULL, 'post1', 'user1', NOW() - INTERVAL '30 minutes', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. フォロー関係の挿入
INSERT INTO follows (id, follower_id, following_id, created_at)
VALUES
  ('follow1', 'user1', 'user2', NOW()),
  ('follow2', 'user2', 'user1', NOW()),
  ('follow3', 'user2', 'user3', NOW()),
  ('follow4', 'user3', 'user2', NOW())
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- 5. いいねの挿入
INSERT INTO likes (id, user_id, post_id, created_at)
VALUES
  -- post1へのいいね
  ('like1', 'user2', 'post1', NOW()),
  ('like2', 'user3', 'post1', NOW()),
  -- reply1へのいいね
  ('like3', 'user1', 'reply1', NOW()),
  -- post2へのいいね
  ('like4', 'user1', 'post2', NOW()),
  ('like5', 'user3', 'post2', NOW()),
  -- post3へのいいね
  ('like6', 'user1', 'post3', NOW()),
  ('like7', 'user2', 'post3', NOW()),
  -- post4へのいいね
  ('like8', 'user2', 'post4', NOW()),
  -- post5へのいいね
  ('like9', 'user1', 'post5', NOW()),
  ('like10', 'user3', 'post5', NOW()),
  -- post6へのいいね
  ('like11', 'user1', 'post6', NOW()),
  ('like12', 'user2', 'post6', NOW()),
  -- post7へのいいね
  ('like13', 'user2', 'post7', NOW()),
  -- post8へのいいね
  ('like14', 'user1', 'post8', NOW()),
  ('like15', 'user3', 'post8', NOW()),
  -- post9へのいいね
  ('like16', 'user1', 'post9', NOW()),
  -- post10へのいいね
  ('like17', 'user2', 'post10', NOW()),
  ('like18', 'user3', 'post10', NOW()),
  -- post11へのいいね
  ('like19', 'user1', 'post11', NOW()),
  -- post12へのいいね
  ('like20', 'user1', 'post12', NOW()),
  ('like21', 'user2', 'post12', NOW()),
  -- post13へのいいね
  ('like22', 'user2', 'post13', NOW()),
  -- post14へのいいね
  ('like23', 'user1', 'post14', NOW()),
  ('like24', 'user3', 'post14', NOW()),
  -- post15へのいいね
  ('like25', 'user1', 'post15', NOW()),
  -- post16へのいいね
  ('like26', 'user2', 'post16', NOW()),
  ('like27', 'user3', 'post16', NOW()),
  -- post17へのいいね
  ('like28', 'user1', 'post17', NOW()),
  -- post18へのいいね
  ('like29', 'user1', 'post18', NOW()),
  ('like30', 'user2', 'post18', NOW()),
  -- post19へのいいね
  ('like31', 'user2', 'post19', NOW()),
  -- post20へのいいね
  ('like32', 'user1', 'post20', NOW()),
  ('like33', 'user3', 'post20', NOW()),
  -- post21へのいいね
  ('like34', 'user1', 'post21', NOW()),
  ('like35', 'user2', 'post21', NOW()),
  -- post22へのいいね
  ('like36', 'user2', 'post22', NOW()),
  -- post23へのいいね
  ('like37', 'user1', 'post23', NOW()),
  ('like38', 'user3', 'post23', NOW()),
  -- post24へのいいね
  ('like39', 'user1', 'post24', NOW()),
  -- post25へのいいね
  ('like40', 'user2', 'post25', NOW()),
  ('like41', 'user3', 'post25', NOW()),
  -- post26へのいいね
  ('like42', 'user1', 'post26', NOW()),
  -- post27へのいいね
  ('like43', 'user1', 'post27', NOW()),
  ('like44', 'user2', 'post27', NOW()),
  -- post28へのいいね
  ('like45', 'user2', 'post28', NOW()),
  -- post29へのいいね
  ('like46', 'user1', 'post29', NOW()),
  ('like47', 'user3', 'post29', NOW()),
  -- post30へのいいね
  ('like48', 'user1', 'post30', NOW()),
  ('like49', 'user2', 'post30', NOW()),
  -- post31へのいいね
  ('like50', 'user2', 'post31', NOW()),
  -- post32へのいいね
  ('like51', 'user1', 'post32', NOW()),
  ('like52', 'user3', 'post32', NOW()),
  -- post33へのいいね
  ('like53', 'user1', 'post33', NOW()),
  -- post34へのいいね
  ('like54', 'user2', 'post34', NOW()),
  ('like55', 'user3', 'post34', NOW()),
  -- post35へのいいね
  ('like56', 'user1', 'post35', NOW())
ON CONFLICT (user_id, post_id) DO NOTHING;

