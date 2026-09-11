'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  InputBase,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { uploadService } from '@/services/upload.service';
import { searchService } from '@/services/search.service';
import { User } from '@/types/api';

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const {
    activeUserId,
    messages,
    conversations,
    isConnected,
    isLoadingMessages,
    isLoadingConversations,
    setActiveUserId,
    sendMessage,
  } = useChat();

  const [messageText, setMessageText] = React.useState('');
  const [attachedMedia, setAttachedMedia] = React.useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = React.useState<{ name: string; url: string } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // New Chat Dialog state
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [userSearchQuery, setUserSearchQuery] = React.useState('');
  const [foundUsers, setFoundUsers] = React.useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = React.useState(false);

  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const docInputRef = React.useRef<HTMLInputElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search users for new chat
  React.useEffect(() => {
    const q = userSearchQuery.trim();
    if (!q) {
      setFoundUsers([]);
      return;
    }
    setIsSearchingUsers(true);
    const timer = setTimeout(() => {
      searchService
        .search(q)
        .then((res) => {
          // Exclude current user from results
          setFoundUsers(res.users.filter((u) => u.id !== currentUser?.id));
        })
        .catch(() => setFoundUsers([]))
        .finally(() => setIsSearchingUsers(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery, currentUser?.id]);

  const activeConversation = conversations.find((c) => c.userId === activeUserId);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadFile(file);
      setAttachedMedia(`http://localhost:5000${res.url}`);
      setAttachedDoc(null);
    } catch (err: any) {
      setUploadError(err?.message || 'خطا در بارگذاری تصویر');
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleDocSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadFile(file);
      setAttachedDoc({ name: res.originalName || file.name, url: `http://localhost:5000${res.url || ''}` });
      setAttachedMedia(null);
    } catch (err: any) {

      setUploadError(err?.message || 'خطا در بارگذاری سند');
    } finally {
      setIsUploading(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserId) return;
    const trimmed = messageText.trim();
    if (!trimmed && !attachedMedia && !attachedDoc) return;

    const textToSend = trimmed || (attachedMedia ? 'تصویر' : 'سند پیوست شده');
    const media = attachedMedia || undefined;
    const docUrl = attachedDoc?.url;
    const docName = attachedDoc?.name;

    setMessageText('');
    setAttachedMedia(null);
    setAttachedDoc(null);

    try {
      await sendMessage(textToSend, {
        mediaUrl: media,
        documentUrl: docUrl,
        documentName: docName,
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
    }
  };

  const handleStartChatWith = (user: User) => {
    setActiveUserId(user.id);
    setNewChatOpen(false);
    setUserSearchQuery('');
  };

  return (
    <AppLayout>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              پیام‌های خصوصی
            </Typography>
            <Chip
              icon={
                <FiberManualRecordIcon
                  sx={{
                    fontSize: 10,
                    color: isConnected ? '#00ba7c' : '#f91880',
                  }}
                />
              }
              label={isConnected ? 'متصل به چت زنده' : 'در حال اتصال...'}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem', fontWeight: 600 }}
            />
          </Stack>

          <Button
            variant="contained"
            size="small"
            onClick={() => setNewChatOpen(true)}
            sx={{ borderRadius: 9999, fontWeight: 700 }}
          >
            پیام جدید
          </Button>
        </Box>

        {/* Main Split Body: Conversations List & Chat View */}
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Right/Left: Conversation List (320px) */}
          <Box
            sx={{
              width: { xs: activeUserId ? '0%' : '100%', sm: 260, md: 320 },
              display: { xs: activeUserId ? 'none' : 'block', sm: 'block' },
              borderInlineEnd: '1px solid',
              borderColor: 'divider',
              overflowY: 'auto',
            }}
          >
            {isLoadingConversations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  هنوز گفتگویی ندارید
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  روی «پیام جدید» کلیک کنید تا با کاربران دیگر چت کنید.
                </Typography>
              </Box>
            ) : (
              conversations.map((c) => {
                const isSelected = c.userId === activeUserId;
                return (
                  <Box
                    key={c.userId}
                    onClick={() => setActiveUserId(c.userId)}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: isSelected ? 'action.selected' : 'transparent',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <Badge badgeContent={c.unreadCount} color="primary">
                      <Avatar src={c.user.avatar} sx={{ width: 44, height: 44 }} />
                    </Badge>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                          {c.user.name}
                        </Typography>
                        {c.lastMessage && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            {new Date(c.lastMessage.createdAt).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        {c.lastMessage?.content || 'آغاز گفتگو'}
                      </Typography>

                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          {/* Active Conversation Panel */}
          <Box
            sx={{
              flex: 1,
              display: { xs: !activeUserId ? 'none' : 'flex', sm: 'flex' },
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            {activeUserId && activeConversation ? (
              <>
                {/* Active Chat Header */}
                <Box
                  sx={{
                    p: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Button
                    onClick={() => setActiveUserId(null)}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', p: 0.5 }}
                  >
                    بازگشت
                  </Button>
                  <Avatar src={activeConversation.user.avatar} sx={{ width: 36, height: 36 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {activeConversation.user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      @{activeConversation.user.username}
                    </Typography>
                  </Box>
                </Box>

                {/* Message Stream */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {isLoadingMessages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
                      گفتگو را با ارسال اولین پیام آغاز کنید!
                    </Typography>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === currentUser?.id;
                      return (
                        <Box
                          key={m.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '75%',
                              p: 1.5,
                              borderRadius: 3,
                              borderTopLeftRadius: isMe ? 3 : 0,
                              borderTopRightRadius: isMe ? 0 : 3,
                              backgroundColor: isMe ? 'primary.main' : 'action.hover',
                              color: isMe ? '#fff' : 'text.primary',
                            }}
                          >
                            {/* Message Image */}
                            {m.mediaUrl && (
                              <Box
                                component="img"
                                src={m.mediaUrl}
                                alt="تصویر ارسالی"
                                sx={{
                                  width: '100%',
                                  maxHeight: 200,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  mb: 1,
                                  display: 'block',
                                }}
                              />
                            )}

                            {/* Message Document */}
                            {m.documentUrl && (
                              <Box
                                onClick={() => window.open(m.documentUrl, '_blank')}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  p: 1,
                                  mb: 1,
                                  borderRadius: 2,
                                  backgroundColor: isMe ? 'rgba(0,0,0,0.15)' : 'background.paper',
                                  cursor: 'pointer',
                                }}
                              >
                                <PictureAsPdfOutlinedIcon fontSize="small" />
                                <Typography variant="caption" sx={{ fontWeight: 700, underline: 'hover' }}>
                                  {m.documentName || 'دانلود سند پیوست'}
                                </Typography>
                              </Box>
                            )}

                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {m.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                textAlign: 'left',
                                mt: 0.5,
                                opacity: 0.7,
                                fontSize: '0.65rem',
                              }}
                            >
                              {new Date(m.createdAt).toLocaleTimeString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Attachments Preview Bar */}
                {(attachedMedia || attachedDoc || uploadError) && (
                  <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    {uploadError && (
                      <Alert severity="warning" onClose={() => setUploadError(null)} sx={{ mb: 1 }}>
                        {uploadError}
                      </Alert>
                    )}
                    {attachedMedia && (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Box
                          component="img"
                          src={attachedMedia}
                          alt="پیش‌نمایش"
                          sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setAttachedMedia(null)}
                          sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff' }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    )}
                    {attachedDoc && (
                      <Chip
                        icon={<PictureAsPdfOutlinedIcon />}
                        label={attachedDoc.name}
                        onDelete={() => setAttachedDoc(null)}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                )}

                {/* Message Input Footer */}
                <Box
                  component="form"
                  onSubmit={handleSend}
                  sx={{
                    p: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageSelect}
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    aria-label="ارسال تصویر"
                  >
                    <ImageOutlinedIcon />
                  </IconButton>

                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    hidden
                    onChange={handleDocSelect}
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => docInputRef.current?.click()}
                    disabled={isUploading}
                    aria-label="ارسال فایل یا سند"
                  >
                    <AttachFileOutlinedIcon />
                  </IconButton>

                  <InputBase
                    fullWidth
                    placeholder="پیام خود را بنویسید..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    sx={{
                      p: 1,
                      px: 2,
                      backgroundColor: 'action.hover',
                      borderRadius: 9999,
                      fontSize: '0.95rem',
                    }}
                  />

                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!messageText.trim() && !attachedMedia && !attachedDoc}
                    aria-label="ارسال"
                  >
                    <SendIcon sx={{ transform: 'rotate(180deg)' }} />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  گفتگویی انتخاب نشده است
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: 320, mb: 2 }}>
                  یک گفتگو را از فهرست سمت راست انتخاب کنید یا پیام جدیدی ارسال نمایید.
                </Typography>
                <Button variant="contained" onClick={() => setNewChatOpen(true)} sx={{ borderRadius: 9999, fontWeight: 700 }}>
                  شروع گفتگوی جدید
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            شروع گفتگوی جدید
          </Typography>
          <IconButton size="small" onClick={() => setNewChatOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            placeholder="جستجوی نام یا نام‌کاربری..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            size="small"
            autoFocus
            sx={{ mb: 2 }}
          />

          {isSearchingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : foundUsers.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
              {userSearchQuery.trim() ? 'کاربری یافت نشد.' : 'نام یا نام‌کاربری مخاطب را وارد کنید.'}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {foundUsers.map((u) => (
                <Box
                  key={u.id}
                  onClick={() => handleStartChatWith(u)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <Avatar src={u.avatar} sx={{ width: 40, height: 40 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      @{u.username}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
