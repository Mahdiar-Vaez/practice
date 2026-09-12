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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LoginIcon from '@mui/icons-material/Login';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { uploadService } from '@/services/upload.service';
import { searchService } from '@/services/search.service';
import { userService } from '@/services/user.service';
import { User } from '@/types/api';
import { ConversationParticipant } from '@/types/chat';

function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

function MessagesContent() {
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();

  const {
    activeUserId,
    messages,
    conversations,
    isConnected,
    isLoadingMessages,
    isLoadingConversations,
    isPartnerTyping,
    setActiveUserId,
    sendMessage,
    sendTyping,
  } = useChat();

  const [selectedUser, setSelectedUser] = React.useState<User | ConversationParticipant | null>(null);
  const [messageText, setMessageText] = React.useState('');
  const [attachedMedia, setAttachedMedia] = React.useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = React.useState<{ name: string; url: string } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // New Chat Dialog state
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [userSearchQuery, setUserSearchQuery] = React.useState('');
  const [foundUsers, setFoundUsers] = React.useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = React.useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = React.useState(false);

  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const docInputRef = React.useRef<HTMLInputElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const typingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle URL query parameter ?userId=... or ?to=...
  React.useEffect(() => {
    const targetParam = searchParams.get('userId') || searchParams.get('to');
    if (targetParam && targetParam !== activeUserId) {
      setActiveUserId(targetParam);
      userService
        .getProfile(targetParam)
        .then((profile) => setSelectedUser(profile))
        .catch(() => {});
    }
  }, [searchParams, activeUserId, setActiveUserId]);

  // Derive active conversation & active user
  const activeConversation = conversations.find((c) => c.userId === activeUserId);
  const activeUser: ConversationParticipant | User | null =
    activeConversation?.user ||
    (selectedUser && selectedUser.id === activeUserId ? selectedUser : null);

  // If activeUserId exists but activeUser is not yet resolved, fetch from API
  React.useEffect(() => {
    if (activeUserId && !activeUser) {
      userService
        .getProfile(activeUserId)
        .then((profile) => setSelectedUser(profile))
        .catch(() => {});
    }
  }, [activeUserId, activeUser]);

  // Auto-scroll messages to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  // Load suggested users when dialog opens
  React.useEffect(() => {
    if (newChatOpen && suggestedUsers.length === 0) {
      userService
        .getAllUsers()
        .then((users) => {
          setSuggestedUsers(users.filter((u) => u.id !== currentUser?.id));
        })
        .catch(() => {});
    }
  }, [newChatOpen, currentUser?.id, suggestedUsers.length]);

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
          setFoundUsers(res.users.filter((u) => u.id !== currentUser?.id));
        })
        .catch(() => setFoundUsers([]))
        .finally(() => setIsSearchingUsers(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery, currentUser?.id]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadFile(file);
      setAttachedMedia(resolveMediaUrl(res.url));
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
      setAttachedDoc({
        name: res.originalName || file.name,
        url: resolveMediaUrl(res.url),
      });
      setAttachedMedia(null);
    } catch (err: any) {
      setUploadError(err?.message || 'خطا در بارگذاری سند');
    } finally {
      setIsUploading(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    sendTyping(true);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    sendTyping(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartChatWith = (u: User) => {
    setSelectedUser(u);
    setActiveUserId(u.id);
    setNewChatOpen(false);
    setUserSearchQuery('');
  };

  // If user is not authenticated, show sign-in requirement screen
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2, opacity: 0.9 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          پیام‌های خصوصی
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mb: 3, lineHeight: 1.6 }}>
          برای گفتگوی زنده، تبادل پیام و ارسال فایل با سایر کاربران، لطفاً ابتدا وارد حساب کاربری خود شوید.
        </Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="medium"
          startIcon={<LoginIcon sx={{ ml: 1, mr: 0 }} />}
          sx={{ borderRadius: 9999, px: 3.5, py: 1, fontWeight: 700 }}
        >
          ورود یا ثبت‌نام
        </Button>
      </Box>
    );
  }

  const usersToShowInModal = userSearchQuery.trim() ? foundUsers : suggestedUsers;

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {/* Top Header - visible on desktop, and on mobile only when no conversation is active */}
      <Box
        sx={{
          height: 54,
          px: 2,
          display: { xs: activeUserId ? 'none' : 'flex', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : '#ffffff',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1rem' }}>
            پیام‌های خصوصی
          </Typography>
          <Chip
            icon={
              <FiberManualRecordIcon
                sx={{
                  fontSize: 8,
                  color: isConnected ? '#00ba7c' : '#f91880',
                }}
              />
            }
            label={isConnected ? 'چت زنده فعال' : 'آفلاین (REST فعال)'}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              height: 24,
              borderColor: isConnected ? 'rgba(0,186,124,0.3)' : 'divider',
            }}
          />
        </Stack>

        <Button
          variant="contained"
          size="small"
          onClick={() => setNewChatOpen(true)}
          sx={{
            borderRadius: 9999,
            fontWeight: 700,
            fontSize: '0.8rem',
            py: 0.5,
            px: 2,
          }}
        >
          پیام جدید
        </Button>
      </Box>

      {/* Main Split Body: Conversations List & Chat View */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Conversations List Panel */}
        <Box
          sx={{
            width: { xs: '100%', sm: 260, md: 320, lg: 360 },
            display: { xs: activeUserId ? 'none' : 'flex', sm: 'flex' },
            flexDirection: 'column',
            borderInlineEnd: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          {isLoadingConversations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={24} />
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', my: 'auto' }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
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
                  onClick={() => {
                    setActiveUserId(c.userId);
                    setSelectedUser(c.user);
                  }}
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: isSelected ? 'action.selected' : 'transparent',
                    transition: 'background-color 0.15s ease',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <Badge badgeContent={c.unreadCount} color="primary">
                    <Avatar src={c.user.avatar} sx={{ width: 40, height: 40 }} />
                  </Badge>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {c.user.name}
                      </Typography>
                      {c.lastMessage && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        color: c.unreadCount > 0 ? 'text.primary' : 'text.secondary',
                        fontWeight: c.unreadCount > 0 ? 700 : 400,
                        fontSize: '0.78rem',
                      }}
                    >
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
            display: { xs: activeUserId ? 'flex' : 'none', sm: 'flex' },
            flexDirection: 'column',
            minWidth: 0,
            height: '100%',
            backgroundColor: 'background.default',
          }}
        >
          {activeUserId && activeUser ? (
            <>
              {/* Active Chat Header */}
              <Box
                sx={{
                  height: 54,
                  px: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : '#ffffff',
                  backdropFilter: 'blur(12px)',
                  zIndex: 5,
                  flexShrink: 0,
                }}
              >
                {/* Mobile Back Button */}
                <IconButton
                  onClick={() => {
                    setActiveUserId(null);
                    setSelectedUser(null);
                  }}
                  sx={{ display: { xs: 'inline-flex', sm: 'none' }, p: 0.75, color: 'text.primary' }}
                  aria-label="بازگشت به فهرست گفتگوها"
                >
                  <ArrowForwardIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <Avatar src={activeUser.avatar} sx={{ width: 34, height: 34 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    {activeUser.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      color: isPartnerTyping ? '#00ba7c' : 'text.secondary',
                      fontWeight: isPartnerTyping ? 700 : 400,
                      display: 'block',
                      fontSize: '0.7rem',
                    }}
                  >
                    {isPartnerTyping ? 'در حال نوشتن...' : `@${activeUser.username}`}
                  </Typography>
                </Box>
              </Box>

              {/* Message Stream */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                }}
              >
                {isLoadingMessages ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary', my: 'auto' }}>
                    <Avatar
                      src={activeUser.avatar}
                      sx={{ width: 52, height: 52, mx: 'auto', mb: 1 }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {activeUser.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
                      @{activeUser.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      اولین پیام خود را بنویسید و ارسال کنید!
                    </Typography>
                  </Box>
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
                            maxWidth: { xs: '85%', sm: '75%', md: '65%' },
                            p: 1.25,
                            borderRadius: 2.5,
                            borderTopLeftRadius: isMe ? 2.5 : 0.5,
                            borderTopRightRadius: isMe ? 0.5 : 2.5,
                            backgroundColor: isMe
                              ? 'primary.main'
                              : (theme) =>
                                  theme.palette.mode === 'dark' ? '#16181c' : '#eff3f4',
                            color: isMe ? '#ffffff' : 'text.primary',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          {/* Message Image */}
                          {m.mediaUrl && (
                            <Box
                              component="img"
                              src={resolveMediaUrl(m.mediaUrl)}
                              alt="تصویر ارسالی"
                              sx={{
                                width: '100%',
                                maxHeight: 220,
                                objectFit: 'cover',
                                borderRadius: 1.5,
                                mb: 0.75,
                                display: 'block',
                                cursor: 'pointer',
                              }}
                              onClick={() => window.open(resolveMediaUrl(m.mediaUrl), '_blank')}
                            />
                          )}

                          {/* Message Document */}
                          {m.documentUrl && (
                            <Box
                              onClick={() => window.open(resolveMediaUrl(m.documentUrl), '_blank')}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                p: 0.75,
                                mb: 0.75,
                                borderRadius: 1.5,
                                backgroundColor: isMe
                                  ? 'rgba(0,0,0,0.2)'
                                  : (theme) =>
                                      theme.palette.mode === 'dark' ? '#202327' : '#ffffff',
                                cursor: 'pointer',
                              }}
                            >
                              <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                {m.documentName || 'دانلود سند'}
                              </Typography>
                            </Box>
                          )}

                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontSize: '0.85rem',
                              lineHeight: 1.4,
                            }}
                          >
                            {m.content}
                          </Typography>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: 0.5,
                              mt: 0.25,
                              opacity: 0.75,
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: '0.62rem' }}>
                              {new Date(m.createdAt).toLocaleTimeString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                            {isMe && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.72rem',
                                  color: m.read ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                  fontWeight: 800,
                                  lineHeight: 1,
                                }}
                                title={m.read ? 'خوانده شد' : 'ارسال شد'}
                              >
                                {m.read ? '✓✓' : '✓'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}

                {/* Partner is typing animation */}
                {isPartnerTyping && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        borderTopRightRadius: 0,
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#16181c' : '#eff3f4',
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                      }}
                    >
                      <FiberManualRecordIcon sx={{ fontSize: 7, color: '#00ba7c' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                        {activeUser.name} در حال نوشتن است...
                      </Typography>
                    </Box>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Attachments Preview Bar */}
              {(attachedMedia || attachedDoc || uploadError) && (
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : '#ffffff',
                  }}
                >
                  {uploadError && (
                    <Alert severity="warning" onClose={() => setUploadError(null)} sx={{ mb: 1, py: 0.25 }}>
                      {uploadError}
                    </Alert>
                  )}
                  {attachedMedia && (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Box
                        component="img"
                        src={attachedMedia}
                        alt="پیش‌نمایش"
                        sx={{ width: 50, height: 50, borderRadius: 1.5, objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => setAttachedMedia(null)}
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          p: 0.25,
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  )}
                  {attachedDoc && (
                    <Chip
                      icon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />}
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
                  p: 1.25,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                  flexShrink: 0,
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
                  sx={{ p: 0.75 }}
                >
                  <ImageOutlinedIcon sx={{ fontSize: 20 }} />
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
                  sx={{ p: 0.75 }}
                >
                  <AttachFileOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <InputBase
                  fullWidth
                  placeholder="پیام خود را بنویسید..."
                  value={messageText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  sx={{
                    py: 0.75,
                    px: 1.75,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#202327' : '#eff3f4',
                    borderRadius: 9999,
                    fontSize: '0.88rem',
                    color: 'text.primary',
                  }}
                />

                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!messageText.trim() && !attachedMedia && !attachedDoc}
                  aria-label="ارسال"
                  sx={{ p: 0.75 }}
                >
                  <SendIcon sx={{ transform: 'rotate(180deg)', fontSize: 18 }} />
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
              <ChatBubbleOutlineIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.4 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                گفتگویی انتخاب نشده است
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: 300, mb: 2, fontSize: '0.82rem' }}>
                یک گفتگو را از فهرست انتخاب کنید یا پیام جدیدی ارسال نمایید.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => setNewChatOpen(true)}
                sx={{ borderRadius: 9999, fontWeight: 700, fontSize: '0.82rem', py: 0.7, px: 2.5 }}
              >
                شروع گفتگوی جدید
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1.5,
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography component="div" variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
            شروع گفتگوی جدید
          </Typography>
          <IconButton size="small" onClick={() => setNewChatOpen(false)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="جستجوی نام یا نام‌کاربری..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            size="small"
            autoFocus
            sx={{ mb: 1.5 }}
          />

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 700, fontSize: '0.72rem' }}
          >
            {userSearchQuery.trim() ? 'نتایج جستجو' : 'کاربران پیشنهادی'}
          </Typography>

          {isSearchingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={20} />
            </Box>
          ) : usersToShowInModal.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3, fontSize: '0.82rem' }}>
              {userSearchQuery.trim() ? 'کاربری یافت نشد.' : 'کاربری در سامانه یافت نشد.'}
            </Typography>
          ) : (
            <Stack spacing={0.75} sx={{ maxHeight: 280, overflowY: 'auto' }}>
              {usersToShowInModal.map((u) => (
                <Box
                  key={u.id}
                  onClick={() => handleStartChatWith(u)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <Avatar src={u.avatar} sx={{ width: 36, height: 36 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', fontSize: '0.72rem' }}>
                      @{u.username}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default function MessagesPage() {
  return (
    <AppLayout fullWidth>
      <React.Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress size={28} />
          </Box>
        }
      >
        <MessagesContent />
      </React.Suspense>
    </AppLayout>
  );
}
